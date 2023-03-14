let input = document.getElementById("input");
let current_sent = document.getElementById("current-sentence");
let current_elem = document.getElementById("current-character");
let info = document.getElementById("info");
let correct_elem = document.getElementById("correct-stat");
let time_elem = document.getElementById("time-stat");
let custom_radio = document.getElementById("custom");
let custom_text = document.getElementById("customtext");
let unicode_radio = document.getElementById("unicode");
let hsk_radio = document.getElementById("HSK");
let repeat_button = document.getElementById("repeat");
let auto_button = document.getElementById("auto");
let simplified_radio = document.getElementById("simplified");
let traditional_radio = document.getElementById("traditional");

const to_simplified = OpenCC.Converter({ from: 't', to: 'cn' });
const to_traditional = OpenCC.Converter({ from: 'cn', to: 't' });

let sentence_index = -1;
let unicodechars = Array.from(zhengma.keys());
let redo = [];
let current = ""
let correct = 0;
let incorrect = false;
let time = 0;
let hints = 0;

custom_radio.addEventListener('click', function (event) {
    console.log(event)
    if (custom_radio.checked) {
        current_sent.innerText = custom_text.value;
        sentence_index = -1;
        repeat_button.disabled = true;
        next();
    } else {
        current_sent.innerText = "";
        repeat_button.disabled = false;
    }
});

hsk_radio.addEventListener('click', function (event) {
    current_sent.innerText = "";
});
unicode_radio.addEventListener('click', function (event) {
    current_sent.innerText = "";
});

custom_text.addEventListener('keyup', function (event) {
    sentence_index = -1;
    if (event.target.value === '') {
        if (custom_radio.checked) {
            custom_radio.checked = false;
            unicode_radio.checked = true;
            repeat_button.disabled = false;
        }
        custom_radio.disabled = true;
        current_sent.innerText = "";
    } else {
        custom_radio.disabled = false;
    }
});

input.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("submit-button").click();
    } else if (event.key === ",") {
        event.preventDefault();
        input.value = "";
        hint();
    } else if (event.key === ".") {
        event.preventDefault();
        input.value = "";
        skip();
    } else if (auto_button.checked) {
        check();
    }
});

function next() {
    if (!custom_radio.checked && redo.length > 0 && Math.random() > 0.75) {
        current = redo.shift()
    } else {
        if (custom_radio.checked) {
            do {
                sentence_index += 1;
                current = custom_text.value.charAt(sentence_index % custom_text.value.length);
            } while ((/\s/).test(current) || current === ',' || current === '.' || current === '、' || current === '。');
            current_sent.innerText = custom_text.value.substring(sentence_index % custom_text.value.length)
        } else {
            if (unicode_radio.checked) {
                current = unicodechars[Math.floor(Math.random() * unicodechars.length)];
            } else if (hsk_radio.checked) {
                current = hskchars[Math.floor(Math.random() * hskchars.length)];
            }
        }
        if (simplified_radio.checked) {
            current = to_simplified(current);
        } else if (traditional_radio.checked) {
            current = to_traditional(current);
        }
    }
    console.log(current);
    current_elem.innerText = current;
    hints = 0;

}

function skip() {
    input.setAttribute("aria-invalid", "");
    update_ans()
    next();
}

function hint() {
    info.value = current + ": ";
    hints += 1;
    if (zhengma.has(current)) {
        for (const item of zhengma.get(current)) {
            for (let i = 0; i < item.length && i < hints; i++) {
                info.value += item.charAt(i);
            }
            for (let i = hints; i < item.length; i++) {
                info.value += "?";
            }
            info.value += " ";
        }
    } else {
        info.value += "?";
    }
}
function check() {
    let str = input.value.toLowerCase();
    if (str.charAt(0) === current.charAt(0)) {
        match = true;
        input.value = str.substring(1);
        submit_correct();
        check();
    }
}

function submit_correct() {
    old = current;
    repeat = (hints > 0 || incorrect) && repeat_button.checked;
    input.setAttribute("aria-invalid", "false");
    incorrect = false;
    correct += 1;
    correct_elem.innerText = correct;

    update_ans();
    next();
    if (repeat) {
        redo.push(old);
    }
}

function submit() {
    let str = input.value.trim().toLowerCase();
    if (current.trim().toLowerCase() === "" || str === current.trim().toLowerCase() || (zhengma.has(current) && zhengma.get(current).has(str))) {
        input.value = "";
        submit_correct()
    } else {
        input.setAttribute("aria-invalid", "true");
        incorrect = true;
    }
}

function update_ans() {
    info.value = current + ": ";
    if (zhengma.has(current)) {
        for (const item of zhengma.get(current)) {
            info.value += item + " ";
        }
    } else {
        info.value += "?";
    }
}
next();
input.focus();
setInterval(() => {
    time += 1;
    time_elem.innerText = time + "s"
}, 1000);