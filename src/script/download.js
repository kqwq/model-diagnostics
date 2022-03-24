
const $ = x => document.querySelector(x)
const $$ = x => document.querySelectorAll(x)

const step1 = $("#step1")
const step2 = $("#step2")
const step3a = $("#step3a")
const step3b = $("#step3b")
const step4 = $("#step4")

function copyText(text) {
  var copyFrom = document.createElement("textarea");
  copyFrom.textContent = text;
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  body.removeChild(copyFrom);
}

step1.addEventListener("click", () => {
  copyText($("#equation").innerText)
})

step2.addEventListener("click", () => {
  copyText($("#r-output").innerText)
})

export default copyText;