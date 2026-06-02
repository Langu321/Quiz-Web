// 1. Dữ liệu câu hỏi và trọng số
const questions = [
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

// 2. Dữ liệu kết quả mô tả
const resultsData = {
    "ET": { title: "Người Điều Hành Quyết Đoán (ET)", desc: "Bạn là người năng nổ, thích hành động và luôn dựa trên lý trí để giải quyết vấn đề." },
    "EF": { title: "Người Kết Nối Ấm Áp (EF)", desc: "Bạn tràn đầy năng lượng, thích giao lưu và luôn quan tâm đến cảm xúc của mọi người xung quanh." },
    "IT": { title: "Nhà Phân Tích Độc Lập (IT)", desc: "Bạn thích sự yên tĩnh, có tư duy logic cao và luôn tự tìm tòi giải pháp cho mọi việc." },
    "IF": { title: "Người Đồng Cảm Sâu Sắc (IF)", desc: "Bạn là người kín đáo, giàu tình cảm và luôn hướng tới sự hòa hợp trong các mối quan hệ." }
};

// State của ứng dụng
let currentQuestionIndex = 0;
let userScores = { E: 0, I: 0, T: 0, F: 0 };

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const progress = document.getElementById('progress');

// Sự kiện bắt đầu
document.getElementById('start-btn').addEventListener('click', () => {
    startScreen.classList.add('hide');
    quizScreen.classList.remove('hide');
    showQuestion();
});

// Hiển thị câu hỏi
function showQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionText.innerText = currentQuestion.text;
    optionsContainer.innerHTML = '';
    
    // Cập nhật thanh tiến trình
    progress.style.width = `${(currentQuestionIndex / questions.length) * 100}%`;

    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option.text;
        button.classList.add('btn', 'option-btn');
        button.addEventListener('click', () => handleAnswer(option.score));
        optionsContainer.appendChild(button);
    });
}

// Xử lý khi chọn câu trả lời
function handleAnswer(score) {
    // Cộng điểm
    for (let key in score) {
        userScores[key] = (userScores[key] || 0) + score[key];
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

// Thêm biến global để lưu tên ở đầu file script.js
let userName = ""; 

// Sửa lại sự kiện Click nút Start
document.getElementById('start-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('username-input').value.trim();
    if (nameInput === "") {
        alert("Vui lòng nhập tên của bạn trước khi bắt đầu nhé!");
        return;
    }
    userName = nameInput; // Lưu tên lại
    startScreen.classList.add('hide');
    quizScreen.classList.remove('hide');
    showQuestion();
});

// Sửa lại hàm showResult() cũ để gọi hàm gửi dữ liệu
function showResult() {
    quizScreen.classList.add('hide');
    resultScreen.classList.remove('hide');

    let type = "";
    type += (userScores.E >= userScores.I) ? "E" : "I";
    type += (userScores.T >= userScores.F) ? "T" : "F";

    const finalResult = resultsData[type] || { title: "Chưa xác định", desc: "Cần thêm câu hỏi." };

    document.getElementById('result-type').innerText = finalResult.title;
    document.getElementById('result-desc').innerText = finalResult.desc;

    // GỌI HÀM GỬI DATA SANG GOOGLE SHEETS TẠI ĐÂY
    sendDataToGoogle(userName, finalResult.title);
}

// Hàm gửi data bằng Fetch API
function sendDataToGoogle(name, result) {
    // THAY ĐƯỜNG LINK WEB APP CỦA BẠN VÀO ĐÂY
    const googleAppScriptUrl = "https://script.google.com/macros/s/AKfycbxhmNx1EfotUH6ilE5wu3ofBIxfPxWnb-kjzQLe6hPrdrUNf9o6dts5GtiUPe4zvncmFA/exec"; 

    const data = {
        name: name,
        result: result
    };

    fetch(googleAppScriptUrl, {
        method: "POST",
        mode: "no-cors", // Bắt buộc phải có để tránh lỗi CORS từ Google
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(() => console.log("Dữ liệu đã được cập nhật real-time lên Google Sheets!"))
    .catch(error => console.error("Lỗi gửi dữ liệu:", error));
}

// Làm lại Quiz
document.getElementById('restart-btn').addEventListener('click', () => {
    currentQuestionIndex = 0;
    userScores = { E: 0, I: 0, T: 0, F: 0 };
    resultScreen.classList.add('hide');
    startScreen.classList.remove('hide');
});
