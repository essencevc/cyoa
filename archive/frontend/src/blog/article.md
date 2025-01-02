# Building a Scalable Choose Your Own Adventure Generator with LLMs

Over the past few weeks, I've been working on building a Choose Your Own Adventure (CYOA) story generator using Large Language Models. What started as a seemingly straightforward task quickly revealed interesting challenges around story generation, parallel processing, and handling long-running LLM operations. In this post, I'll share what I learned about building such a system at scale and why Restate ended up being the perfect tool for the job.

## The Challenge with Traditional Approaches

When I first approached this problem, the obvious solution seemed to be generating the entire story tree at once - having the LLM create a complete narrative with all possible branches and outcomes.

However, this approach quickly showed its limitations:

1. Story coherence degraded as the tree grew larger
2. Generation times became impractical
3. References between story branches became inconsistent

This meant that I would have to wait for a good 1.5-2 minutes for the entire story to be generated, before realising that my model was inserting references to chocies that didn't exist or had strayed off the original story path. This was not great and so I started looking for a better approach.

![Traditional Approach](planning.webp)

I also wanted to integrate image generation, which would add a lot of complexity to the problem since each image would take around 4-5 seconds to generate even with the flux-1.5-schenll service. This meant that the user would have to wait for a good 10 minutes before realising that the story had failed. So I had two real problems to solve

1. How could I handle these long-running operations with an easy retry mechanism
2. How could I generate better stories that were more consistent and had interesting choices quickly and efficiently

Around this time, I discovered Restate, a workflow engine for LLMs that allows you to coordinate long-running operations and handle failures gracefully. For anyone that's ever built something similar, you'll know that this means that

1. You don't need to have a queue and a service and 10 different workers that you need to manage
2. More importantly, you could bring any service that you want as long as it supports a HTTP 1 connection - restate would handle the coordination and retries

And so I started tinkering around with it and that led me to the second approach below.

## A Better Architecture: Parallel Story Generation

Instead of generating the entire story tree at once, I found much better results by breaking the process into parallel operations

![Parallel Approach](parallel.webp)

1. Generate an initial story setting and plot summary
2. Create the first set of choices independently
3. Recursively generate subsequent choices in parallel

The best part about using restate here was that I didn't have to really change the code I had written in my jupyter notebook to make it work. I just needed to wrap the calls in a try-catch loop and then copy it into a function used a restate annotation to make it work.

### Defining Our Story Structure

First, we need to define what our story data looks like. I used Pydantic models for validation:

```python
class FinalStory(BaseModel):
    story_setting: str
    plot_summary: str
    choices: list[FinalStoryChoice]

class RewrittenChoice(BaseModel):
    choice_description: str
    choice_consequences: str
    choices: list[str]

    @field_validator("choices")
    def validate_choices(cls, v, info: ValidationInfo):
        original_choice = info.context["choice"]
        if original_choice in v:
            raise ValueError(
                "Choices must be unique - do not repeat the original choice"
            )
        return v
```

The validator ensures we don't generate duplicate choices, which helps maintain story diversity.

### Coordinating Long-Running Operations with Restate

One of the biggest challenges was handling the long-running LLM operations. A single story branch could take several minutes to generate. This is where Restate became invaluable:

```python
@story_workflow.main()
async def generate_story(ctx: WorkflowContext, story_input: StoryInput):
    try:
        # Generate initial story and plot
        story = await ctx.run(
            "Generate Initial Story",
            wrap_async_call(
                coro_fn=generate_initial_story,
                client=client,
                story_input=story_input
            )
        )

        # Generate first level choices in parallel
        initial_choices = await generate_parallel_choices(
            ctx, story, max_depth=3
        )

        return FinalStory(
            story_setting=story.setting,
            plot_summary=story.plot,
            choices=initial_choices
        )

    except TerminalError as e:
        log_story_error(story_input.story_id, e)
        raise TerminalError("Story generation failed")
```

The key benefits of using Restate here are:

1. **Automatic Retries**: If an LLM call fails, Restate handles retrying the operation
2. **State Management**: The workflow maintains its state across retries by saving the individual states using the `ctx.run()` calls
3. **Error Handling**: Failed generations don't corrupt the entire story

### Parallel Choice Generation

The real power comes from generating choices in parallel:

```python
async def generate_parallel_choices(
    ctx: WorkflowContext,
    story: Story,
    max_depth: int,
    current_depth: int = 0
):
    if current_depth >= max_depth:
        return []

    # Generate 3 choices in parallel
    choice_tasks = [
        ctx.run(
            f"Generate Choice {i}",
            wrap_async_call(
                coro_fn=generate_choice,
                story=story,
                previous_choices=[]
            )
        )
        for i in range(3)
    ]

    choices = await asyncio.gather(*choice_tasks)

    # Recursively generate next level of choices
    for choice in choices:
        choice.next_choices = await generate_parallel_choices(
            ctx,
            story,
            max_depth,
            current_depth + 1
        )

    return choices
```

This approach lets us generate up to 120 unique story nodes in about 70 seconds using `gpt-4o-mini`, compared to 40-60 nodes in the same time with a sequential approach.

### Using an Awaitable

Another huge benefit that restate provided was that we could use an awaitable to generate the next set of choices. This meant that while I was waiting for my images to be generated on Modal, I could suspend and terminate the existing workflow without losing any state. To resolve and continue off where I left off, I just needed to make an api call to `/restate/awakeables/{name}/resolve` with the correct promise name.

## Key Learnings

After building this system, here are the main insights I gained:

1. **Break Down Complex Generation**: Rather than trying to generate everything at once, break it into manageable chunks that can be processed in parallel.

2. **Use a Workflow Engine**: Tools like Restate handle the complex orchestration of long-running operations, retries, and state management.

3. **Plan for Failures**: LLM operations can fail for many reasons. Build retry logic and graceful degradation into your system.

## Performance Comparison

Here's how the parallel approach compares to sequential generation:

| Metric          | Sequential | Parallel  |
| --------------- | ---------- | --------- |
| Nodes Generated | 40-60      | 120+      |
| Generation Time | 70s        | 70s       |
| Story Coherence | Lower      | Higher    |
| Error Recovery  | Difficult  | Automatic |

## Conclusion

Building a CYOA generator taught me a lot about managing complex LLM workflows. The key is breaking down the problem into parallel operations and using the right tools to manage the complexity. While it might seem easier to generate everything at once, a more structured approach yields better results and scales more effectively.

If you're building anything that needs to coordinate a lot of long-running operations, I'd strongly recommend checking out Restate. Getting everything running was really easy and I was able to focus on the core logic while the restate handled all the heavy lifting and orchestration.
