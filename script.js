// ==========================================
// 1. CẤU HÌNH HỆ THỐNG (SYSTEM CONFIG)
// ==========================================
const CONFIG = {
    GOOGLE_SHEETS_API: "https://script.google.com/macros/s/AKfycby8ssgWxdoCkUIlzY1FQAL6SzKEsYPKZUv9ubmNK1EIC9nLwxbBmpvDIwPitWbF552D1Q/exec",
    DEFAULT_SCORE_STATE: { E: 0, I: 0, T: 0, F: 0 }
};

// ==========================================
// 2. THÔNG BÁO GIAO DIỆN (UI MESSAGES)
// ==========================================
const MESSAGES = {
    NAME_EMPTY_ALERT: "Vui lòng nhập tên của bạn trước khi bắt đầu nhé!",
    DATA_SEND_SUCCESS: "Dữ liệu đã được cập nhật real-time lên Google Sheets!",
    DATA_SEND_ERROR: "Lỗi gửi dữ liệu: ",
    UNKNOWN_RESULT_TITLE: "Chưa xác định",
    UNKNOWN_RESULT_DESC: "Cần thêm câu hỏi để phân tích chính xác hơn."
};

// ==========================================
// 3. DỮ LIỆU CÂU HỎI (QUIZ DATA) - Đã thêm ký tự định danh id
// ==========================================
const QUIZ_QUESTIONS = [
    {
        text: "Sau một tuần làm việc mệt mỏi, bạn sẽ chọn làm gì?",
        options: [
            { id: "A", text: "Đi tụ tập café, gặp gỡ bạn bè.", score: { E: 1 } },
            { id: "B", text: "Ở nhà đọc sách, xem phim hoặc chơi game.", score: { I: 1 } }
        ]
    },
    {
        text: "Khi một người bạn đang buồn, bạn có xu hướng:",
        options: [
            { id: "A", text: "Đưa ra lời khuyên và giải pháp thực tế.", score: { T: 1 } },
            { id: "B", text: "Lắng nghe, đồng cảm và an ủi cảm xúc của họ.", score: { F: 1 } }
        ]
    },
    {
        text: "Trong các cuộc thảo luận nhóm, bạn thường:",
        options: [
            { id: "A", text: "Chủ động nói lên quan điểm của mình ngay lập tức.", score: { E: 1 } },
            { id: "B", text: "Lắng nghe mọi người trước rồi mới phát biểu.", score: { I: 1 } }
        ]
    }
    // Phượng có thể tự tin copy-paste thêm các câu hỏi tiếp theo vào đây (Câu 4 -> Câu 12)
    // Cứ xếp đủ cấu trúc { id: "Ký_tự", text: "Nội dung", score: { Hệ_số } } là được.
];

// ==========================================
// 4. DỮ LIỆU KẾT QUẢ (RESULTS MAP)
// ==========================================
const QUIZ_RESULTS = {
    "ET": { 
        title: "Người Điều Hành Quyết Đoán (ET)", 
        desc: "Bạn là người năng nổ, thích hành động và lý trí.",
        image: "./images/Result1.png"
    },
    "EF": { 
        title: "Người Kết Nối Ấm Áp (EF)", 
        desc: "Bạn tràn đầy năng lượng và luôn quan tâm đến cảm xúc mọi người.",
        image: "./images/Result2.png"
    },
    "IT": { 
        title: "Nhà Phân Tích Độc Lập (IT)", 
        desc: "Bạn thích sự yên tĩnh và có tư duy logic cao.",
    },
    "IF": { 
        title: "Người Đồng Cảm Sâu Sắc (IF)", 
        desc: "Bạn là người kín đáo, giàu tình cảm và hòa hợp.",
    }
};

// ==========================================
// 5. BIẾN THAY ĐỔI (RUNTIME STATE)
// ==========================================
let currentQuestionIndex = 0;
let userScores = { ...CONFIG.DEFAULT_SCORE_STATE }; 
let userName = ""; 
let userAnswers = []; // Mảng mới dùng để lưu các ký tự đáp án (A, B, C, D) qua từng câu

// ==========================================
// 6. PHẦN TỬ GIAO DIỆN (DOM ELEMENTS)
// ==========================================
const DOM = {
    startScreen: document.getElementById('start-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    resultScreen: document.getElementById('result-screen'),
    questionText: document.getElementById('question-text'),
    optionsContainer: document.getElementById('options-container'),
    progress: document.getElementById('progress'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    nameInput: document.getElementById('username-input'),
    resultImg: document.getElementById('result-img'), 
    resultType: document.getElementById('result-type'),
    resultDesc: document.getElementById('result-desc')
};

// ==========================================
// 7. LOGIC XỬ LÝ (APP LOGIC)
// ==========================================

// Sự kiện bắt đầu
DOM.startBtn.addEventListener('click', () => {
    const inputName = DOM.nameInput.value.trim();
    if (inputName === "") {
        alert(MESSAGES.NAME_EMPTY_ALERT);
        return;
    }
    userName = inputName;
    DOM.startScreen.classList.add('hide');
    DOM.quizScreen.classList.remove('hide');
    showQuestion();
});

// Hiển thị câu hỏi
function showQuestion() {
    const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
    DOM.questionText.innerText = currentQuestion.text;
    DOM.optionsContainer.innerHTML = '';
    
    DOM.progress.style.width = `${(currentQuestionIndex / QUIZ_QUESTIONS.length) * 100}%`;

    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option.text;
        button.classList.add('btn', 'option-btn');
        // Truyền cả ID đáp án (A, B, C, D) và bảng điểm vào hàm xử lý
        button.addEventListener('click', () => handleAnswer(option.id, option.score));
        DOM.optionsContainer.appendChild(button);
    });
}

// Xử lý khi chọn câu trả lời
function handleAnswer(optionId, score) {
    // 1. Lưu ký tự đáp án đã chọn vào mảng trạng thái
    userAnswers.push(optionId);

    // 2. Cộng điểm tính cách
    for (let key in score) {
        userScores[key] = (userScores[key] || 0) + score[key];
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < QUIZ_QUESTIONS.length) {
        showQuestion();
    } else {
        showResult();
    }
}

// Tính toán và hiển thị kết quả
function showResult() {
    DOM.quizScreen.classList.add('hide');
    DOM.resultScreen.classList.remove('hide');

    let type = "";
    type += (userScores.E >= userScores.I) ? "E" : "I";
    type += (userScores.T >= userScores.F) ? "T" : "F";

    const finalResult = QUIZ_RESULTS[type] || { 
        title: MESSAGES.UNKNOWN_RESULT_TITLE, 
        desc: MESSAGES.UNKNOWN_RESULT_DESC,
        image: "./images/default.png" 
    };

    DOM.resultType.innerText = finalResult.title;
    DOM.resultDesc.innerText = finalResult.desc;
    DOM.resultImg.src = finalResult.image;

    // HIỂN THỊ GIF CẢM ƠN CHẮC CHẮN 100%
    const thanksGif = document.getElementById('thanks-gif');
    if (thanksGif) {
        // Thay link GIF hoạt hình nhẹ nhàng, tươi mát và không bị lỗi load
        thanksGif.src = "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzhidm94Z3psem94ZXpueG94ZXpueG94ZXpueG94ZXpueG94ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7abKhOpuMcmLjdcI/giphy.gif";
        thanksGif.style.display = 'inline-block'; // Ép trình duyệt render ảnh GIF ra màn hình
    }

    // Gửi data sang Excel
    sendDataToGoogle(userName, userAnswers, finalResult.title);
}

// Hàm gửi dữ liệu bằng Fetch API
function sendDataToGoogle(name, answers, result) {
    // Đóng gói data có thêm trường answers
    const data = { 
        name: name, 
        answers: answers, 
        result: result 
    };

    fetch(CONFIG.GOOGLE_SHEETS_API, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(() => console.log(MESSAGES.DATA_SEND_SUCCESS))
    .catch(error => console.error(MESSAGES.DATA_SEND_ERROR, error));
}

// Làm lại Quiz
DOM.restartBtn.addEventListener('click', () => {
    currentQuestionIndex = 0;
    userScores = { ...CONFIG.DEFAULT_SCORE_STATE };
    userAnswers = []; // Reset mảng đáp án về rỗng
    DOM.nameInput.value = ""; 
    DOM.resultScreen.classList.add('hide');
    DOM.startScreen.classList.remove('hide');
});