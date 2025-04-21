// ======================= Initialization =======================
window.onload = function() {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('quizzes')) {
      // Sample quizzes
      localStorage.setItem('quizzes', JSON.stringify([
        {
          id: 1,
          title: "Math Quiz",
          questions: [
            { question: "2 + 2 = ?", options: ["3", "4", "5"], answer: "4" },
            { question: "5 * 3 = ?", options: ["8", "15", "20"], answer: "15" },
            { question: "10 / 2 = ?", options: ["2", "5", "10"], answer: "5" }
          ]
        },
        {
          id: 2,
          title: "Science Quiz",
          questions: [
            { question: "Water freezes at?", options: ["0°C", "100°C", "50°C"], answer: "0°C" },
            { question: "Sun is a?", options: ["Planet", "Star", "Galaxy"], answer: "Star" },
            { question: "H2O is?", options: ["Oxygen", "Water", "Hydrogen"], answer: "Water" }
          ]
        },
        {
          id: 3,
          title: "General Knowledge Quiz",
          questions: [
              { question: "What is the capital of France?", options: ["Paris", "Rome", "Berlin"], correctAnswer: "Paris" },
              { question: "Which planet is closest to the Sun?", options: ["Mercury", "Earth", "Venus"], correctAnswer: "Mercury" },
              { question: "What is the largest ocean?", options: ["Atlantic", "Indian", "Pacific"], correctAnswer: "Pacific" },
          ]
      }
      ]));
    }
  
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    if (loginTab && registerTab) {
      loginTab.addEventListener('click', showLogin);
      registerTab.addEventListener('click', showRegister);
    }
    
    // Load dynamic content based on page
    if (document.getElementById('userEmail')) loadHomePage();
    if (document.getElementById('quizTitle')) loadQuizPage();
    if (document.getElementById('userScores')) loadDashboard();
  };
  
  // ======================= Auth Functions =======================
  function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
  }
  
  function showRegister() {
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerTab').classList.add('active');
    document.getElementById('loginTab').classList.remove('active');
  }
  
  function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    let users = JSON.parse(localStorage.getItem('users'));
  
    if (users.find(user => user.email === email)) {
      alert("User already exists!");
      return;
    }
  
    users.push({ email, password, scores: {} });
    localStorage.setItem('users', JSON.stringify(users));
    alert("Registration successful! Please login.");
    showLogin();
  }
  
  function login() {
    let email = document.getElementById('loginEmail').value;
    let password = document.getElementById('loginPassword').value;

    if (email === 'admin@quiz.com' && password === 'admin123') {
        localStorage.setItem('currentUser', JSON.stringify({ email, role: 'admin' }));
        window.location.href = 'dashboard.html';
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'home.html';
    } else {
        alert('Invalid credentials!');
    }
}
  
  // ======================= Home Page =======================
  function loadHomePage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) window.location.href = 'index.html';
    document.getElementById('userEmail').innerText = user.email;
  
    const quizzes = JSON.parse(localStorage.getItem('quizzes'));
    const quizList = document.getElementById('quizList');
  
    quizzes.forEach(q => {
      const div = document.createElement('div');
      div.innerHTML = `<button onclick="startQuiz(${q.id})">${q.title}</button>`;
      quizList.appendChild(div);
    });
  }
  
  function startQuiz(id) {
    window.location.href = `quiz.html?id=${id}`;
  }
  
  // ======================= Quiz Page =======================
  function loadQuizPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = parseInt(urlParams.get('id'));
    const quizzes = JSON.parse(localStorage.getItem('quizzes'));
    const quiz = quizzes.find(q => q.id === quizId);
  
    document.getElementById('quizTitle').innerText = quiz.title;
  
    const form = document.getElementById('quizForm');
    quiz.questions.forEach((q, idx) => {
      const div = document.createElement('div');
      div.innerHTML = `
        <h4>${q.question}</h4>
        ${q.options.map(opt => `
          <label><input type="radio" name="q${idx}" value="${opt}"> ${opt}</label><br><br>
        `).join('')}
      `;
      form.appendChild(div);
    });
  }
  
  function submitQuiz() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = parseInt(urlParams.get('id'));
    const quizzes = JSON.parse(localStorage.getItem('quizzes'));
    const quiz = quizzes.find(q => q.id === quizId);
  
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      const selected = document.querySelector(`input[name="q${idx}"]:checked`);
      if (selected && selected.value === q.answer) {
        score++;
      }
    });
  
    document.getElementById('scoreDisplay').innerText = `You scored ${score}/${quiz.questions.length}`;
  
    let users = JSON.parse(localStorage.getItem('users'));
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
    users = users.map(u => {
      if (u.email === currentUser.email) {
        u.scores[`Quiz${quizId}`] = score;
        currentUser = u; // update current user
      }
      return u;
    });
  
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
  
  // ======================= Dashboard =======================
  function loadDashboard() {
    const users = JSON.parse(localStorage.getItem('users'));
    const container = document.getElementById('userScores');
    container.innerHTML = '<h2>Registered Users & Scores</h2>';
  
    users.forEach(u => {
      const div = document.createElement('div');
      div.innerHTML = `
        <strong>${u.email}</strong><br>
        ${Object.entries(u.scores).map(([quiz, score]) => `${quiz}: ${score}`).join('<br>')}
        <hr>
      `;
      container.appendChild(div);
    });
  }
  