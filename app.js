try {
// BrainSpark Arena - Complete App Implementation
window.APP_TUTORIAL_HTML = `
<div class="sf-tutorial">
  <h2>BrainSpark Arena Guide</h2>
  <div class="sf-tutorial-step">
    <h3>1. Learning Decks</h3>
    <p>Browse starter decks in the Home tab. Each deck contains quick quizzes to test your knowledge.</p>
    <img src="https://example.com/tut1.png" alt="Decks screenshot">
  </div>
  <div class="sf-tutorial-step">
    <h3>2. Create Flashcards</h3>
    <p>Tap the '+' button or go to Actions tab to create custom flashcards with your own questions.</p>
    <img src="https://example.com/tut2.png" alt="Create card screenshot">
  </div>
  <div class="sf-tutorial-step">
    <h3>3. Study & Search</h3>
    <p>Find your saved cards in Records tab. Use search to filter by topic or category.</p>
    <img src="https://example.com/tut3.png" alt="Search screenshot">
  </div>
  <div class="sf-tutorial-step">
    <h3>4. Earn Rewards</h3>
    <p>Complete challenges, refer friends, and track your XP points in your Profile.</p>
    <img src="https://example.com/tut4.png" alt="Rewards screenshot">
  </div>
</div>
`;

// Database and UI Helper Functions
const BrainSpark = {
  getStats: async () => {
    const cards = await FactoryDB.getItems("card") || [];
    const txs = await FactoryDB.getTransactions() || [];
    const completed = txs.filter(t => t.type === 'challenge').length;
    return {
      cards: cards.length,
      completed,
      points: txs.reduce((sum, t) => sum + (t.points || 0), 0)
    };
  },

  renderHero: (stats) => {
    const user = FactoryDB.getUserSync();
    return `
      <div class="sf-hero-card">
        <div class="sf-hero-badge">LIVE ENGINE</div>
        <h2>${user?.name || 'Learner'}</h2>
        <div class="sf-hero-points">${stats.points} XP</div>
        <div class="sf-hero-glow"></div>
      </div>
    `;
  },

  renderDecks: () => {
    const decks = [
      { title: "AI & Tech", question: "What does 'GPT' stand for?", answer: "Generative Pre-trained Transformer", category: "tech" },
      { title: "Business Math", question: "What's the formula for ROI?", answer: "(Gain - Cost) / Cost", category: "business" },
      { title: "World Facts", question: "Largest country by area?", answer: "Russia", category: "general" },
      { title: "Science Lab", question: "Chemical symbol for gold?", answer: "Au", category: "science" }
    ];

    return decks.map(deck => `
      <div class="sf-hcard" onclick="FactoryNav.openDetail('${deck.title}', BrainSpark.renderDeckDetail(${JSON.stringify(deck)}))">
        <div class="sf-hcard-category ${deck.category}">${deck.category}</div>
        <h3>${deck.title}</h3>
        <div class="sf-hcard-glow"></div>
      </div>
    `).join('');
  },

  renderDeckDetail: (deck) => {
    return `
      <div class="sf-deck-detail">
        <h3>${deck.question}</h3>
        <div class="sf-answer-hidden" id="deck-answer">${deck.answer}</div>
        <button class="sf-btn-primary" onclick="document.getElementById('deck-answer').classList.toggle('sf-answer-hidden');">
          Reveal Answer
        </button>
        <button class="sf-btn-reward" onclick="
          FactoryDB.recordTx('challenge', 10, 'Deck: ${deck.title}');
          FactoryUI.toast('+10 XP earned!');
          FactoryNav.back();
          window.renderTabs();
        ">
          Answer & Claim +10 Pts
        </button>
        <button class="sf-btn-back" onclick="FactoryNav.back()">Back to Decks</button>
      </div>
    `;
  },

  renderStats: (stats) => {
    return `
      <div class="sf-stat-grid">
        <div class="sf-stat-card">
          <div class="sf-stat-value">${stats.cards}</div>
          <div class="sf-stat-label">Saved Flashcards</div>
        </div>
        <div class="sf-stat-card">
          <div class="sf-stat-value">${stats.completed}</div>
          <div class="sf-stat-label">Challenges Done</div>
        </div>
      </div>
    `;
  },

  renderCardList: async (query = '') => {
    const cards = await FactoryDB.getItems("card") || [];
    const filtered = cards.filter(card => 
      card.key.toLowerCase().includes(query.toLowerCase()) || 
      (card.value?.category || '').toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
      return `<div class="sf-empty-state">No flashcards found${query ? ' for "' + query + '"' : ''}</div>`;
    }

    return filtered.map(card => `
      <div class="sf-list-row" onclick="FactoryNav.openDetail('Flashcard', BrainSpark.renderCardDetail(${JSON.stringify(card)}))">
        <div class="sf-list-badge ${card.value?.category || 'general'}">${card.value?.category || 'general'}</div>
        <div class="sf-list-text">${card.key}</div>
        <div class="sf-list-points">+${card.value?.points || 0} XP</div>
      </div>
    `).join('');
  },

  renderCardDetail: (card) => {
    return `
      <div class="sf-card-detail">
        <div class="sf-card-category ${card.value?.category || 'general'}">${card.value?.category || 'general'}</div>
        <h3>${card.key}</h3>
        <div class="sf-card-answer">
          <h4>Answer:</h4>
          <p>${card.value?.answer || 'No answer provided'}</p>
        </div>
        <div class="sf-card-points">+${card.value?.points || 0} XP</div>
        <button class="sf-btn-back" onclick="FactoryNav.back()">Back to List</button>
      </div>
    `;
  },

  renderActivity: async () => {
    const txs = await FactoryDB.getTransactions() || [];
    return txs.slice(0, 5).map(tx => `
      <div class="sf-activity-row">
        <div class="sf-activity-type ${tx.type}">${tx.type}</div>
        <div class="sf-activity-desc">${tx.description || 'Activity'}</div>
        <div class="sf-activity-points">+${tx.points || 0}</div>
      </div>
    `).join('');
  }
};

// View Renderers
window.renderTabs = async function() {
  const stats = await BrainSpark.getStats();
  
  // View 1 - Home
  document.getElementById('view-1').innerHTML = `
    ${BrainSpark.renderHero(stats)}
    ${BrainSpark.renderStats(stats)}
    <div class="sf-section-title">Starter Learning Decks</div>
    <div class="sf-hscroll">
      ${BrainSpark.renderDecks()}
    </div>
    <div class="sf-section-title">Recent Activity</div>
    <div class="sf-activity-list">
      ${await BrainSpark.renderActivity()}
    </div>
  `;

  // View 2 - Actions
  document.getElementById('view-2').innerHTML = `
    <div class="sf-form-card">
      <h3>Create Custom Flashcard</h3>
      <div class="sf-form-group">
        <label>Question / Topic</label>
        <input type="text" id="card-question" placeholder="What is...?">
      </div>
      <div class="sf-form-group">
        <label>Answer / Key Note</label>
        <textarea id="card-answer" placeholder="The answer is..."></textarea>
      </div>
      <div class="sf-form-group">
        <label>Category</label>
        <select id="card-category">
          <option value="tech">Tech</option>
          <option value="business">Business</option>
          <option value="science">Science</option>
          <option value="general">General</option>
        </select>
      </div>
      <div class="sf-form-group">
        <label>XP Points (10-50)</label>
        <input type="number" id="card-points" min="10" max="50" value="10">
      </div>
      <button class="sf-btn-primary" onclick="
        const question = document.getElementById('card-question').value;
        const answer = document.getElementById('card-answer').value;
        const category = document.getElementById('card-category').value;
        const points = FactoryUI.safeNum(document.getElementById('card-points').value, 10);
        
        if (!question || !answer) {
          FactoryUI.toast('Please fill all fields');
          return;
        }
        
        FactoryDB.saveItem('card', question, { 
          answer, category, points, status: 'active' 
        });
        FactoryDB.recordTx('reward', points, 'Card: ' + question);
        FactoryUI.toast('Flashcard saved! +' + points + ' XP');
        document.getElementById('card-question').value = '';
        document.getElementById('card-answer').value = '';
        window.renderTabs();
      ">Save Flashcard</button>
    </div>
    
    <div class="sf-action-tiles">
      <div class="sf-action-tile" onclick="FactoryEngine.openTutorial()">
        <div class="sf-tile-icon">?</div>
        <div class="sf-tile-text">Open App Guide</div>
      </div>
      <div class="sf-action-tile" onclick="FactoryEngine.openReferShare()">
        <div class="sf-tile-icon">↗</div>
        <div class="sf-tile-text">Refer & Earn +25 Pts</div>
      </div>
    </div>
  `;

  // View 3 - Records
  document.getElementById('view-3').innerHTML = `
    <div class="sf-search-container">
      <input type="text" id="records-search" placeholder="Search flashcards..." 
             oninput="window.onSearchInput(this.value)">
    </div>
    <div class="sf-list-container" id="records-list">
      ${await BrainSpark.renderCardList()}
    </div>
  `;

  // View 4 - Profile
  const user = FactoryDB.getUserSync();
  document.getElementById('view-4').innerHTML = `
    <div class="sf-profile-card">
      <div class="sf-profile-header">
        <div class="sf-profile-avatar">${user?.name?.charAt(0) || 'U'}</div>
        <h2>${user?.name || 'User'}</h2>
        <div class="sf-profile-points">${stats.points} XP</div>
      </div>
      
      <div class="sf-profile-details">
        <div class="sf-profile-row">
          <label>Email</label>
          <div>${user?.email || 'Not provided'}</div>
        </div>
        <div class="sf-profile-row">
          <label>Mobile</label>
          <div>${user?.mobile || 'Not provided'}</div>
        </div>
      </div>
      
      <div class="sf-profile-actions">
        <button class="sf-btn-secondary" onclick="FactoryEngine.openReferShare()">
          Refer & Share
        </button>
        <button class="sf-btn-secondary" onclick="FactoryEngine.openTutorial()">
          How to Use / Tutorial
        </button>
        <button class="sf-btn-secondary" onclick="FactoryUI.downloadPDF()">
          Download Study PDF
        </button>
        <button class="sf-btn-logout" onclick="FactoryNav.logout()">
          Log Out
        </button>
      </div>
    </div>
  `;
};

// Aliases for tab rendering
window.renderTabs12 = async () => {
  const stats = await BrainSpark.getStats();
  document.getElementById('view-1').innerHTML = `
    ${BrainSpark.renderHero(stats)}
    ${BrainSpark.renderStats(stats)}
    <div class="sf-section-title">Starter Learning Decks</div>
    <div class="sf-hscroll">
      ${BrainSpark.renderDecks()}
    </div>
  `;
  
  document.getElementById('view-2').innerHTML = `
    <div class="sf-form-card">
      <h3>Create Custom Flashcard</h3>
      <!-- Form content same as in renderTabs -->
    </div>
    <!-- Action tiles same as in renderTabs -->
  `;
};

window.renderTabs34 = async () => {
  document.getElementById('view-3').innerHTML = `
    <div class="sf-search-container">
      <input type="text" id="records-search" placeholder="Search flashcards..." 
             oninput="window.onSearchInput(this.value)">
    </div>
    <div class="sf-list-container" id="records-list">
      ${await BrainSpark.renderCardList()}
    </div>
  `;
  
  const user = FactoryDB.getUserSync();
  const stats = await BrainSpark.getStats();
  document.getElementById('view-4').innerHTML = `
    <div class="sf-profile-card">
      <!-- Profile content same as in renderTabs -->
    </div>
  `;
};

// Event Handlers
window.onFloatingAction = function() {
  FactoryUI.modal(`
    <div class="sf-quick-card">
      <h3>Add Fast Flashcard</h3>
      <input type="text" id="quick-question" placeholder="Quick question...">
      <textarea id="quick-answer" placeholder="Short answer..."></textarea>
      <button class="sf-btn-primary" onclick="
        const question = document.getElementById('quick-question').value;
        const answer = document.getElementById('quick-answer').value;
        if (question && answer) {
          FactoryDB.saveItem('card', question, { 
            answer, category: 'general', points: 10, status: 'active' 
          });
          FactoryDB.recordTx('reward', 10, 'Quick Card: ' + question);
          FactoryUI.toast('Flashcard saved! +10 XP');
          FactoryUI.closeModal();
          window.renderTabs();
        } else {
          FactoryUI.toast('Please enter both fields');
        }
      ">Save</button>
    </div>
  `);
};

window.onSearchInput = async function(q) {
  document.getElementById('records-list').innerHTML = await BrainSpark.renderCardList(q);
};

window.onTabChange = function(tabNum) {
  FactoryUI.refreshIcons();
};

window.onAppReady = async function() {
  await window.renderTabs();
  FactoryUI.refreshIcons();
};

// Initialize if user is logged in
if (window.FactoryDB && FactoryDB.getUserSync()) {
  window.onAppReady();
}

// Apply theme colors
document.documentElement.style.setProperty('--primary-color', '#8a2be2');
document.documentElement.style.setProperty('--secondary-color', '#ff1493');
document.documentElement.style.setProperty('--dark-bg', '#121212');
document.documentElement.style.setProperty('--card-bg', 'rgba(30, 30, 40, 0.7)');
} catch (sfErr) { console.error("AppJS Error:", sfErr); if (window.FactoryNav) window.FactoryNav.ensureNonBlank(); }