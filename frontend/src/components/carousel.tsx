"use client";

import React, { useCallback, useEffect, useRef } from "react";
import {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType,
} from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";

import { NextButton, PrevButton, useCarouselButtons } from "./carousel-button";
import { CarouselIndicator, useCarouselIndicator } from "./carousel-indicator";
import { Link } from "react-router-dom";
import SignInModal from "./signin";

type EmblaCarouselPropType = {
  className?: string;
  slides: React.ReactNode[];
  options?: EmblaOptionsType;
  maxRotateX?: number;
  maxRotateY?: number;
  maxScale?: number;
  tweenFactorBase?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
};

interface SlideData {
  id: string;
  text: string;
  name: string;
  role: string;
  image: string;
}

interface CarouselSlideProps {
  data: SlideData;
  isProtected?: boolean;
}

const TWEEN_FACTOR_BASE = 0.7;
const MAX_ROTATE_X = 35;
const MAX_ROTATE_Y = 15;
const MAX_SCALE = 0.9;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

const EmblaCarousel: React.FC<EmblaCarouselPropType> = (props) => {
  const {
    slides,
    options,
    className,
    autoplay = true,
    autoplayDelay = 2000,
    maxRotateX = MAX_ROTATE_X,
    maxRotateY = MAX_ROTATE_Y,
    maxScale = MAX_SCALE,
    tweenFactorBase = TWEEN_FACTOR_BASE,
    showIndicators = true,
    showArrows = true,
  } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(
    options,
    autoplay
      ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })]
      : []
  );

  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = useCarouselButtons(emblaApi);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useCarouselIndicator(emblaApi);

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode: HTMLElement) => {
      return slideNode.querySelector(".embla__slide__number") as HTMLElement;
    });
  }, []);

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = tweenFactorBase * emblaApi.scrollSnapList().length;
  }, []);

  const tweenTranslate = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === "scroll";

      emblaApi
        .scrollSnapList()
        .forEach((scrollSnap: number, snapIndex: number) => {
          let diffToTarget = scrollSnap - scrollProgress;
          const slidesInSnap = engine.slideRegistry[snapIndex];

          slidesInSnap.forEach((slideIndex: number) => {
            if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

            if (engine.options.loop) {
              engine.slideLooper.loopPoints.forEach((loopItem: any) => {
                const target = loopItem.target();

                if (slideIndex === loopItem.index && target !== 0) {
                  const sign = Math.sign(target);

                  if (sign === -1) {
                    diffToTarget = scrollSnap - (1 + scrollProgress);
                  }
                  if (sign === 1) {
                    diffToTarget = scrollSnap + (1 - scrollProgress);
                  }
                }
              });
            }

            const tweenValue = Math.abs(diffToTarget * tweenFactor.current);
            const rotateX = numberWithinRange(
              tweenValue * maxRotateX,
              0,
              maxRotateX
            );
            const rotateY = numberWithinRange(
              tweenValue * maxRotateY * Math.sign(diffToTarget),
              -maxRotateY,
              maxRotateY
            );
            const scale = numberWithinRange(1 - tweenValue * 0.1, maxScale, 1);

            const tweenNode = tweenNodes.current[slideIndex];
            tweenNode.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
            tweenNode.style.zIndex = Math.round(
              (1 - tweenValue) * 100
            ).toString();
          });
        });
    },
    []
  );

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenTranslate(emblaApi);

    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenTranslate)
      .on("scroll", tweenTranslate);
  }, [emblaApi, setTweenFactor, setTweenNodes, tweenTranslate]);

  return (
    <div className="">
      <div className="py-10 overflow-visible" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              className="max-[350px]:[flex:0_0_18rem] [flex:0_0_20rem] flex pl-4"
              key={index}
            >
              <div
                className={`embla__slide__number w-full flex items-center justify-center h-full ${
                  className || ""
                }`}
                style={{
                  transition: "transform 0.3s ease-out, z-index 0.3s step-end",
                }}
              >
                <div className="h-full w-full">
                  <div className="group relative z-0 h-full w-full overflow-hidden rounded">
                    <div className="overflow-hidden rounded h-full w-full">
                      {slide}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showArrows && (
        <div className="flex items-center justify-center gap-4 py-10">
          <PrevButton
            className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center hover:ring-1 hover:ring-neutral-300 dark:hover:ring-neutral-700 rounded-full"
            onClick={onPrevButtonClick}
            disabled={prevBtnDisabled}
          />
          <NextButton
            className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center hover:ring-1 hover:ring-neutral-300 dark:hover:ring-neutral-700 rounded-full"
            onClick={onNextButtonClick}
            disabled={nextBtnDisabled}
          />
        </div>
      )}
      {showIndicators && (
        <div className="flex items-center justify-center mt-5">
          <div className="flex items-center justify-center gap-3">
            {scrollSnaps.map((_, index) => (
              <CarouselIndicator
                key={index}
                onClick={() => onDotButtonClick(index)}
                className={"bg-transparent relative touch-manipulation inline-flex no-underline cursor-pointer border-0 p-0 m-0 w-[1.5rem] h-5 items-center justify-center rounded-md [-webkit-tap-highlight-color:rgba(255,255,255,0)] [-webkit-appearance:none] after:bg-neutral-200 dark:after:bg-neutral-800 after:w-full after:h-0.5 after:flex after:items-center after:justify-center after:content-['']".concat(
                  index === selectedIndex
                    ? "embla__dot--selected before:absolute before:left-0 before:bg-neutral-800 dark:before:bg-neutral-200 before:h-0.5 before:top-1/2 before:-translate-y-1/2 before:transition-all before:duration-300 before:ease-out before:w-full"
                    : "before:absolute before:left-0 before:bg-neutral-200 dark:before:bg-neutral-800 before:h-0.5 before:top-1/2 before:-translate-y-1/2 before:transition-all before:duration-300 before:ease-out before:w-0"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CarouselSlidesData = [
  {
    id: "b9b1ae78-389d-46f1-bd6d-4aaa407aed98",
    text: "Galatic Pursuit",
    name: "Action, Suspense",
    role: "A thrilling space adventure awaits as our pilot discovers a new suprise hiding in every galaxy",
    image:
      "https://restate-story.s3.ap-southeast-1.amazonaws.com/b9b1ae78-389d-46f1-bd6d-4aaa407aed98/banner.jpg",
  },
  {
    id: "18f00675-02d5-4f34-be4f-7fe5243e6080",
    text: "The Last Heist",
    name: "Action, Adventure",
    role: "it's the final job before Elize retires, but when they arrive on the scene, they find old colleagues ready to take them down instead at every turn ",
    image:
      "https://restate-story.s3.ap-southeast-1.amazonaws.com/18f00675-02d5-4f34-be4f-7fe5243e6080/banner.jpg",
  },
  {
    id: "2547d732-3855-450f-a825-0c1de422b3c9",
    text: "The Great Gnome Heist",
    name: "Mystery, Suspense",
    role: "A group of friends discover a hidden treasure trove of gnomes in the woods, but as they dig deeper, they uncover a dangerous secret that could change the course of history",
    image:
      "https://restate-story.s3.ap-southeast-1.amazonaws.com/2547d732-3855-450f-a825-0c1de422b3c9/banner.jpg",
  },
  {
    id: "1b890ad7-8000-4ca2-b0d5-7330073e0dcb",
    text: "The Crystal Crown",
    name: "Fantasy, Adventure",
    role: "A young girl discovers her hidden powers and embarks on a journey to save Eldoria from the tyranny of the Iron Council which has banned magic for generations",
    image:
      "https://restate-story.s3.ap-southeast-1.amazonaws.com/1b890ad7-8000-4ca2-b0d5-7330073e0dcb/banner.jpg",
  },
  {
    id: "8c8d8415-706d-4d0f-9e68-1b08f7b4c724",
    text: "Galactic Rift",
    name: "Fantasy, Adventure",
    role: "A mysterious rift in space-time opens, forcing brave explorers to venture into an alternate universe filled with strange creatures and advanced tech to save humanity.",
    image:
      "https://restate-story.s3.ap-southeast-1.amazonaws.com/8c8d8415-706d-4d0f-9e68-1b08f7b4c724/banner.jpg",
  },
];

export const CarouselSlide: React.FC<CarouselSlideProps> = ({
  data,
  isProtected = true,
}) => {
  const SlideContent = () => (
    <div className="w-full h-full flex relative cursor-grab border rounded-xl select-none">
      <div className="w-full h-full z-[1]">
        <div className="w-full h-full p-3.5 flex flex-col md:flex-row gap-x-10 items-start md:items-end justify-end md:justify-between text-content">
          <img
            src={data.image}
            alt={data.name}
            className="w-full h-full object-cover absolute top-0 left-0 rounded-xl -z-10"
          />
          <div className="flex flex-col gap-y-2 w-full h-fit backdrop-blur-sm border border-neutral-200/50 rounded-xl p-5 text-white">
            <h2 className="text-base text-balance font-medium leading-6 text-left">
              {data.text}
            </h2>
            <div className="flex flex-col gap-y-0.5">
              <p className="text-balance text-sm font-semibold text-left">
                {data.name}
              </p>
              <p className="text-balance text-xs font-medium text-left">
                {data.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isProtected) {
    return (
      <SignInModal
        fallback={<div className="w-full h-full">{<SlideContent />}</div>}
        redirectUrl={`/dashboard/story/${data.id}`}
      >
        <Link
          to={`/dashboard/story/${data.id}`}
          key={data.id}
          className="w-full h-full"
        >
          <SlideContent />
        </Link>
      </SignInModal>

      // </SignInModal>
    );
  }

  return (
    <Link
      to={`/dashboard/story/${data.id}`}
      key={data.id}
      className="w-full h-full"
    >
      <SlideContent />
    </Link>
  );
};

export function Carousel() {
  const OPTIONS: EmblaOptionsType = { loop: true };

  const slides = CarouselSlidesData.map((testimonial) => (
    <CarouselSlide key={testimonial.id} data={testimonial} isProtected={true} />
  ));

  return (
    <section className="flex flex-col items-center justify-center w-full">
      <div className="max-w-7xl mx-auto overflow-hidden p-5 pt-10 md:py-20 pb-28 flex items-center justify-center w-full">
        <EmblaCarousel
          slides={slides}
          options={OPTIONS}
          autoplay={true}
          showIndicators={true}
          showArrows={true}
          autoplayDelay={4000}
          className="w-full min-h-[25rem] h-full"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-1/5 bg-gradient-to-r from-white dark:from-black md:block"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/5 bg-gradient-to-l from-white dark:from-black md:block"></div>
      </div>
    </section>
  );
}
