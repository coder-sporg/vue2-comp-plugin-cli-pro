export default {
  inserted(el, binding) {
    // 获取期望的文本行数，默认为1
    const n = binding.value || 1;
    // （1）实现超出n行有省略号
    el.style.display = "-webkit-box";
    el.style.webkitBoxOrient = "vertical";
    el.style.webkitLineClamp = n;
    el.style.overflow = "hidden";
    // （2）实现鼠标移入在溢出情况下才有提示文案
    if (el.clientHeight < el.scrollHeight) {
      el.title = el.innerHTML;
    }
  },
};
