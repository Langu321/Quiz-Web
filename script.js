// ==========================================
// 1. CẤU HÌNH HỆ THỐNG (SYSTEM CONFIG)
// ==========================================
const CONFIG = {
    GOOGLE_SHEETS_API: "https://script.google.com/macros/s/AKfycbxhmNx1EfotUH6ilE5wu3ofBIxfPxWnb-kjzQLe6hPrdrUNf9o6dts5GtiUPe4zvncmFA/exec",
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
// 3. DỮ LIỆU CÂU HỎI (QUIZ DATA)
// ==========================================
const QUIZ_QUESTIONS = [
    {
        text: "Sau một tuần làm việc mệt mỏi, bạn sẽ chọn làm gì?",
        options: [
            { text: "Đi tụ tập café, gặp gỡ bạn bè.", score: { E: 1 } },
            { text: "Ở nhà đọc sách, xem phim hoặc chơi game.", score: { I: 1 } }
        ]
    },
    {
        text: "Khi một người bạn đang buồn, bạn có xu hướng:",
        options: [
            { text: "Đưa ra lời khuyên và giải pháp thực tế.", score: { T: 1 } },
            { text: "Lắng nghe, đồng cảm và an ủi cảm xúc của họ.", score: { F: 1 } }
        ]
    },
    {
        text: "Trong các cuộc thảo luận nhóm, bạn thường:",
        options: [
            { text: "Chủ động nói lên quan điểm của mình ngay lập tức.", score: { E: 1 } },
            { text: "Lắng nghe mọi người trước rồi mới phát biểu.", score: { I: 1 } }
        ]
    }
];

// ==========================================
// 4. DỮ LIỆU KẾT QUẢ (RESULTS MAP)
// ==========================================
const QUIZ_RESULTS = {
    "ET": { 
        title: "Người Điều Hành Quyết Đoán (ET)", 
        desc: "Bạn là người năng nổ, thích hành động và lý trí.",
        image: "./images/Result1.png" // Thay link ảnh thật của bạn vào đây
    },
    "EF": { 
        title: "Người Kết Nối Ấm Áp (EF)", 
        desc: "Bạn tràn đầy năng lượng và luôn quan tâm đến cảm xúc mọi người.",
        image: "./images/Result2.png"
    },
    "IT": { 
        title: "Nhà Phân Tích Độc Lập (IT)", 
        desc: "Bạn thích sự yên tĩnh và có tư duy logic cao.",
        image: "./images/Result3.png"
    },
    "IF": { 
        title: "Người Đồng Cảm Sâu Sắc (IF)", 
        desc: "Bạn là người kín đáo, giàu tình cảm và hòa hợp.",
        image: "./images/Result4.png"
    }
};

// ==========================================
// 5. BIẾN THAY ĐỔI (RUNTIME STATE)
// ==========================================
let currentQuestionIndex = 0;
let userScores = { ...CONFIG.DEFAULT_SCORE_STATE }; // Clone object tránh tham chiếu
let userName = ""; 

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
    resultImg: document.getElementById('result-img'), // Thêm dòng này
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
    
    // Cập nhật thanh tiến trình
    DOM.progress.style.width = `${(currentQuestionIndex / QUIZ_QUESTIONS.length) * 100}%`;

    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option.text;
        button.classList.add('btn', 'option-btn');
        button.addEventListener('click', () => handleAnswer(option.score));
        DOM.optionsContainer.appendChild(button);
    });
}

// Xử lý khi chọn câu trả lời
function handleAnswer(score) {
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
        image: "https://your-link.com/images/default.png" 
    };

    // Hiển thị text
    DOM.resultType.innerText = finalResult.title;
    DOM.resultDesc.innerText = finalResult.desc;

    // HIỂN THỊ ẢNH
    if (finalResult.image) {
        DOM.resultImg.src = finalResult.image;
        DOM.resultImg.style.display = "block"; // Hiện ảnh nếu có
    } else {
        DOM.resultImg.style.display = "none"; // Ẩn nếu không có link ảnh
    }

    // Gửi data sang Google Sheets
    sendDataToGoogle(userName, finalResult.title);
}

// Hàm gửi dữ liệu bằng Fetch API
function sendDataToGoogle(name, result) {
    const data = { name: name, result: result };

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
    DOM.nameInput.value = ""; // Xóa text trong ô nhập tên cũ
    DOM.resultScreen.classList.add('hide');
    DOM.startScreen.classList.remove('hide');
});