import type { Locale } from "@/contexts/LanguageContext";

export const reviewCopy: Record<Locale, {
    reviews: string; rating: string; newBusiness: string; reviewsCount: (n: number) => string; all: string; more: string;
    empty: string; reply: string; yourRating: string; comment: string; commentPlaceholder: string; send: string; sending: string;
    thanks: string; thanksText: string; rate: string; rateVisit: string; failed: string; starLabel: (n: number) => string;
    reasons: Record<"already_reviewed" | "not_visited" | "not_finished" | "expired", string>; accessNeeded: string; openBusiness: string;
    pageTitle: string; visit: string; specialist: string; hiddenNote: string;
}> = {
    hy: {
        reviews: "Կարծիքներ", rating: "Գնահատական", newBusiness: "Նոր", reviewsCount: (n) => `${n} կարծիք`, all: "Բոլորը", more: "Ցույց տալ ավելին",
        empty: "Դեռ կարծիք չկա։", reply: "Բիզնեսի պատասխանը", yourRating: "Ձեր գնահատականը", comment: "Մեկնաբանություն", commentPlaceholder: "Ինչը դուր եկավ, ինչը կարելի է լավացնել (ըստ ցանկության)",
        send: "Ուղարկել կարծիքը", sending: "Ուղարկվում է…", thanks: "Շնորհակալություն", thanksText: "Ձեր կարծիքը հրապարակված է բիզնեսի էջում։", rate: "Գնահատել", rateVisit: "Գնահատել այցը",
        failed: "Չհաջողվեց ուղարկել կարծիքը", starLabel: (n) => `${n} աստղ`,
        reasons: { already_reviewed: "Այս այցի համար կարծիքն արդեն թողնված է։", not_visited: "Չեղարկված կամ չկայացած այցի համար կարծիք թողնել հնարավոր չէ։", not_finished: "Կարծիք կարող եք թողնել այցից հետո։", expired: "Կարծիք թողնելու ժամկետն անցել է։" },
        accessNeeded: "Հղումը սխալ է կամ ժամկետանց։ Բացեք ամրագրման էջը նամակի հղումով և կրկին փորձեք։", openBusiness: "Բացել բիզնեսի էջը",
        pageTitle: "Ինչպե՞ս անցավ այցը", visit: "Այց", specialist: "Մասնագետ", hiddenNote: "Կարծիքը թաքցված է Vizit-ի կողմից",
    },
    ru: {
        reviews: "Отзывы", rating: "Оценка", newBusiness: "Новый", reviewsCount: (n) => `Отзывов: ${n}`, all: "Все", more: "Показать ещё",
        empty: "Отзывов пока нет.", reply: "Ответ бизнеса", yourRating: "Ваша оценка", comment: "Комментарий", commentPlaceholder: "Что понравилось и что можно улучшить (по желанию)",
        send: "Отправить отзыв", sending: "Отправка…", thanks: "Спасибо", thanksText: "Ваш отзыв опубликован на странице бизнеса.", rate: "Оценить", rateVisit: "Оценить визит",
        failed: "Не удалось отправить отзыв", starLabel: (n) => `${n} из 5`,
        reasons: { already_reviewed: "Отзыв об этом визите уже оставлен.", not_visited: "Для отменённого или несостоявшегося визита отзыв оставить нельзя.", not_finished: "Отзыв можно оставить после визита.", expired: "Срок для отзыва истёк." },
        accessNeeded: "Ссылка неверна или устарела. Откройте страницу записи по ссылке из письма и попробуйте снова.", openBusiness: "Открыть страницу бизнеса",
        pageTitle: "Как прошёл визит?", visit: "Визит", specialist: "Специалист", hiddenNote: "Отзыв скрыт Vizit",
    },
    en: {
        reviews: "Reviews", rating: "Rating", newBusiness: "New", reviewsCount: (n) => `${n} review${n === 1 ? "" : "s"}`, all: "All", more: "Show more",
        empty: "No reviews yet.", reply: "Business reply", yourRating: "Your rating", comment: "Comment", commentPlaceholder: "What you liked and what could be better (optional)",
        send: "Send review", sending: "Sending…", thanks: "Thank you", thanksText: "Your review is published on the business page.", rate: "Rate", rateVisit: "Rate your visit",
        failed: "Could not send the review", starLabel: (n) => `${n} of 5`,
        reasons: { already_reviewed: "This visit already has a review.", not_visited: "Cancelled or missed visits cannot be reviewed.", not_finished: "You can leave a review after the visit.", expired: "The time to leave a review has passed." },
        accessNeeded: "The link is wrong or has expired. Open your booking page from the email link and try again.", openBusiness: "Open business page",
        pageTitle: "How was your visit?", visit: "Visit", specialist: "Specialist", hiddenNote: "Hidden by Vizit",
    },
};
