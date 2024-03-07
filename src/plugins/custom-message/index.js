import Vue from "vue";
import CustomMessage from "./src/main.vue";

const MessageBoxConstructor = Vue.extend(CustomMessage);

//装有instance消息弹框组件对象的容器
let instances = [];

function Message(data) {
  data = data || {};

  if (typeof data === "string") {
    data = {
      message: data,
    };
  }

  data.onClose = function () {
    // console.log("onClose");

    Message.close(instance);
  };

  const instance = new MessageBoxConstructor({
    // propsData: {
    //   message,
    // },
    data,
  });

  const divEl = document.createElement("div");
  document.body.appendChild(divEl);

  instance.$mount(divEl);

  // 偏移量的设置
  let offset = data.offset || 20;
  let offsetTop = offset;

  /**
   * 注意：此处要在循环之后在push，因为第一个消息弹框不需要计算offsetTop
   */
  instances.forEach((item) => {
    offsetTop += item.$el.offsetHeight + offset;
  });

  instance.$el.style.top = offsetTop + "px";
  instances.push(instance);
}

Message.close = function (instance) {
  /**
   * 获取当前实例的高度
   * 把这个instance后面的所有实例的top减去这个高度，再减去偏移
   */

  let removeHeight = instance.$el.offsetHeight + instance.offset;
  // 把传递进来的instance在容器instances中删除
  let index = instances.findIndex((item) => item === instance);
  instances = instances.filter((item) => item !== instance);

  // 对应的消息弹框消失后，在该消息弹框后面的消息弹框会依次出现顶上去的效果
  // 原理：找到对应消息弹框的下标位置，通过循环改变对应的消息弹框后面所有消息弹框的高度
  for (let i = index; i < instances.length; i++) {
    instances[i].$el.style.top =
      parseFloat(instances[i].$el.style.top) - removeHeight + "px";
  }
};

["info", "success", "error", "warning"].forEach((type) => {
  Message[type] = function (data) {
    if (typeof data === "string") {
      data = {
        message: data,
      };
    }
    data.type = type;
    return Message(data);
  };
});

export default Message;
