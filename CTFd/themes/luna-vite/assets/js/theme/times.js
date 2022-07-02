import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);

export default () => {
  document.querySelectorAll("[data-time]").forEach($el => {
    const time = $el.getAttribute("data-time");
    const format = $el.getAttribute("data-time-format") || "D MMMM YYYY, H:mm:ss";
    $el.innerText = dayjs(time).format(format);
  });
};

export function shortFormat(date) {
    return dayjs(date).format("D MMM, HH:mm");
}
