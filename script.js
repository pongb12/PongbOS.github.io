let data = {
    notes: [],
    playlist: [],
    wallpapers: [
        'https://picsum.photos/400/800?blur=2&random=1',
        'https://picsum.photos/400/800?blur=2&random=2',
        'https://picsum.photos/400/800?blur=2&random=3'
    ],
    homeWallpapers: [
        'https://picsum.photos/400/800?blur=3&random=4',
        'https://picsum.photos/400/800?blur=3&random=5',
        'https://picsum.photos/400/800?blur=3&random=6'
    ],
    currentWallpaperIndex: 0,
    currentHomeWallpaperIndex: 0,
    accentColor: '#4ba3ff',
    logs: [],
    currentTrackIndex: -1,
    isPlaying: false,
    chatHistory: [],
    callPort: Math.floor(1000 + Math.random() * 9000),
    friends: [],
    callStatus: 'idle',
    currentAudio: null,
    currentCall: null
};

document.documentElement.style.setProperty('--accent', data.accentColor);

function logEvent(event) {
    const timestamp = new Date().toLocaleString('vi-VN');
    data.logs.unshift(`[${timestamp}] ${event}`);
    if (data.logs.length > 100) data.logs.pop();
    console.log(`PongbOS: ${event}`);
}

window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('boot-animation').style.display = 'none';
        logEvent('Hệ thống khởi động thành công');
        updateTime();
        updateWallpapers();
    }, 3800);
});

const apps = [
    { name: 'Browser', emoji: '🌐', color: '#4ba3ff' },
    { name: 'Music', emoji: '🎵', color: '#ff6b6b' },
    { name: 'ChatCBD', emoji: '🤖', color: '#4ecdc4' },
    { name: 'Call', emoji: '📞', color: '#45b7d1' },
    { name: 'Notes', emoji: '🗒️', color: '#96ceb4' },
    { name: 'Speedtest', emoji: '📊', color: '#ffeaa7' },
    { name: 'Settings', emoji: '⚙️', color: '#a29bfe' }
];

const grid = document.getElementById('grid');
apps.forEach(app => {
    const div = document.createElement('div');
    div.className = 'icon';
    div.innerHTML = `<div>${app.emoji}</div><small>${app.name}</small>`;
    div.onclick = () => openApp(app.name);
    grid.appendChild(div);
});

document.querySelectorAll('.dock-icon').forEach(icon => {
    icon.onclick = () => openApp(icon.dataset.app);
});

const appWindow = document.getElementById('appWindow');
const appTitle = document.getElementById('appTitle');
const appBody = document.getElementById('appBody');

document.getElementById('closeApp').onclick = closeApp;

function cleanupCurrentApp() {
    const currentApp = appTitle.textContent;
    
    if (currentApp === 'Music' && data.currentAudio) {
        data.currentAudio.pause();
        data.currentAudio.src = '';
        data.currentAudio = null;
        data.isPlaying = false;
    }
    
    if (currentApp === 'Call') {
        data.callStatus = 'idle';
        data.currentCall = null;
    }
    
    const oldAudio = document.getElementById('audioPlayer');
    if (oldAudio) oldAudio.remove();
}

function closeApp() {
    appWindow.classList.remove('show');
    appWindow.classList.add('hide');
    setTimeout(() => {
        cleanupCurrentApp();
        appWindow.classList.remove('hide');
        appWindow.style.display = 'none';
        appBody.innerHTML = '';
    }, 300);
}

function openApp(name) {
    try {
        cleanupCurrentApp();
        
        appTitle.textContent = name;
        appBody.innerHTML = '<div style="text-align: center; padding: 40px;"><div style="font-size: 24px;">📱</div><p>Đang tải ứng dụng...</p></div>';
        appWindow.style.display = 'flex';
        appWindow.classList.add('show');

        logEvent(`Mở ứng dụng: ${name}`);

        setTimeout(() => {
            switch(name) {
                case 'Browser': loadBrowser(); break;
                case 'Music': loadMusic(); break;
                case 'ChatCBD': loadChatCBD(); break;
                case 'Call': loadCall(); break;
                case 'Notes': loadNotes(); break;
                case 'Speedtest': loadSpeedtest(); break;
                case 'Settings': loadSettings(); break;
                default: 
                    appBody.innerHTML = `<div class="empty-state"><div class="icon">❓</div><p>Ứng dụng chưa được phát triển</p></div>`;
            }
        }, 200);
        
    } catch (error) {
        console.error(`Error opening app ${name}:`, error);
        appBody.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><h3>Lỗi ứng dụng</h3><p>Ứng dụng gặp sự cố khi khởi động.</p><button onclick="openApp('${name}')">Thử lại</button></div>`;
        logEvent(`Lỗi mở ứng dụng: ${name}`);
    }
}

function loadBrowser() {
    appBody.innerHTML = `
        <div class="browser-nav">
            <input id="browserUrl" placeholder="Tìm kiếm hoặc nhập URL" value="https://www.bing.com">
            <button onclick="navigateBrowser()">🔍</button>
        </div>
        <div class="browser-frame-container">
            <iframe id="browserFrame" src="https://www.bing.com" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"></iframe>
        </div>
    `;

    document.getElementById('browserUrl').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') navigateBrowser();
    });
}

function navigateBrowser() {
    try {
        let url = document.getElementById('browserUrl').value.trim();
        if (!url) return;

        if (!url.includes('.') || !url.startsWith('http')) {
            url = `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
        } else if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        document.getElementById('browserFrame').src = url;
        logEvent(`Truy cập: ${url.substring(0, 50)}...`);
    } catch (error) {
        console.error("Browser navigation error:", error);
        alert("Không thể tải trang. Vui lòng kiểm tra URL.");
    }
}

function loadMusic() {
    const playlist = data.playlist.length > 0 ? data.playlist.map((song, i) => `
        <div class="song-item ${i === data.currentTrackIndex ? 'playing' : ''}">
            <div class="song-info">
                <div class="song-title">${escapeHtml(song.name || 'Không có tiêu đề')}</div>
                <div class="song-url">${escapeHtml(song.url.substring(0, 50))}...</div>
            </div>
            <div class="song-controls">
                <button onclick="playTrack(${i})" ${i === data.currentTrackIndex && data.isPlaying ? 'style="background: #ff4757;"' : ''}>
                    ${i === data.currentTrackIndex && data.isPlaying ? '⏸' : '▶'}
                </button>
                <button onclick="removeTrack(${i})" style="background: #ff4757;">🗑</button>
            </div>
        </div>
    `).join('') : '<div class="empty-state"><div class="icon">🎵</div><p>Playlist trống</p><p>Thêm nhạc để bắt đầu</p></div>';

    const currentTrack = data.currentTrackIndex >= 0 ? data.playlist[data.currentTrackIndex] : null;

    appBody.innerHTML = `
        <div class="music-container">
            <div class="add-song-form">
                <input id="songUrl" placeholder="Nhập link nhạc (MP3, SoundCloud, etc.)" type="url">
                <input id="songName" placeholder="Tên bài hát (tùy chọn)">
                <button onclick="addTrack()">➕ Thêm vào playlist</button>
            </div>

            <div class="music-player">
                <div class="player-header">
                    <div class="album-art">🎵</div>
                    <div class="track-info">
                        <div class="track-title">${currentTrack ? escapeHtml(currentTrack.name) : 'Chưa chọn bài hát'}</div>
                        <div class="track-artist">PongbOS Music</div>
                    </div>
                </div>
                
                <div class="progress-container" onclick="seekTrack(event)">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
                
                <div class="time-display">
                    <span id="currentTime">0:00</span>
                    <span id="totalTime">0:00</span>
                </div>
                
                <div class="player-controls">
                    <div class="control-btn" onclick="previousTrack()">⮜</div>
                    <div class="control-btn play-btn" onclick="togglePlayback()" id="playButton">
                        ${data.isPlaying ? '⏸' : '▶'}
                    </div>
                    <div class="control-btn" onclick="nextTrack()">⮞</div>
                </div>
            </div>

            <div class="music-playlist">
                ${playlist}
            </div>
        </div>
        
        <audio id="audioPlayer" 
               ontimeupdate="updateProgress()" 
               onended="nextTrack()"
               onloadedmetadata="updateDuration()"
               onerror="handleAudioError()"></audio>
    `;

    if (data.currentAudio && data.isPlaying) {
        const newAudio = document.getElementById('audioPlayer');
        if (newAudio && currentTrack) {
            newAudio.src = currentTrack.url;
            newAudio.currentTime = data.currentAudio.currentTime || 0;
            newAudio.play().catch(() => {
                data.isPlaying = false;
                updatePlayerUI();
            });
            data.currentAudio = newAudio;
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addTrack() {
    const urlInput = document.getElementById('songUrl');
    const nameInput = document.getElementById('songName');
    const url = urlInput.value.trim();
    const name = nameInput.value.trim();
    
    if (!url) {
        alert('Vui lòng nhập URL nhạc');
        return;
    }

    try {
        new URL(url);
    } catch {
        alert('URL không hợp lệ');
        return;
    }

    data.playlist.push({ url, name: name || `Track ${data.playlist.length + 1}` });
    urlInput.value = '';
    nameInput.value = '';
    loadMusic();
    logEvent(`Thêm track: ${name || url.substring(0, 30)}`);
}

function removeTrack(index) {
    if (index === data.currentTrackIndex) {
        stopPlayback();
    }
    
    data.playlist.splice(index, 1);
    
    if (data.currentTrackIndex > index) {
        data.currentTrackIndex--;
    } else if (data.currentTrackIndex === index) {
        data.currentTrackIndex = -1;
    }
    
    loadMusic();
    logEvent('Xóa track khỏi playlist');
}

function playTrack(index) {
    const track = data.playlist[index];
    if (!track) return;

    data.currentTrackIndex = index;
    const audio = document.getElementById('audioPlayer');
    
    if (audio) {
        audio.src = track.url;
        audio.load();
        
        audio.play().then(() => {
            data.isPlaying = true;
            data.currentAudio = audio;
            updatePlayerUI();
            logEvent(`Phát: ${track.name}`);
        }).catch(error => {
            console.error('Playback failed:', error);
            alert('Không thể phát nhạc. Vui lòng kiểm tra đường dẫn.');
            data.isPlaying = false;
            updatePlayerUI();
        });
    }
}

function togglePlayback() {
    if (data.currentTrackIndex < 0 || data.currentTrackIndex >= data.playlist.length) {
        if (data.playlist.length > 0) {
            playTrack(0);
        }
        return;
    }

    const audio = document.getElementById('audioPlayer');
    if (!audio) return;

    if (data.isPlaying) {
        audio.pause();
        data.isPlaying = false;
    } else {
        audio.play().then(() => {
            data.isPlaying = true;
        }).catch(error => {
            console.error('Playback failed:', error);
            data.isPlaying = false;
        });
    }
    
    updatePlayerUI();
}

function stopPlayback() {
    const audio = document.getElementById('audioPlayer');
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    data.isPlaying = false;
    data.currentAudio = null;
    updatePlayerUI();
}

function nextTrack() {
    if (data.playlist.length === 0) return;
    
    const nextIndex = (data.currentTrackIndex + 1) % data.playlist.length;
    playTrack(nextIndex);
}

function previousTrack() {
    if (data.playlist.length === 0) return;
    
    const prevIndex = data.currentTrackIndex > 0 ? data.currentTrackIndex - 1 : data.playlist.length - 1;
    playTrack(prevIndex);
}

function seekTrack(event) {
    const audio = document.getElementById('audioPlayer');
    if (!audio || !audio.duration) return;

    const container = event.currentTarget;
    const rect = container.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    
    audio.currentTime = percentage * audio.duration;
}

function updateProgress() {
    const audio = document.getElementById('audioPlayer');
    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    
    if (audio && progressBar && audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progress}%`;
        
        if (currentTimeEl) {
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    }
}

function updateDuration() {
    const audio = document.getElementById('audioPlayer');
    const totalTimeEl = document.getElementById('totalTime');
    
    if (audio && totalTimeEl && audio.duration) {
        totalTimeEl.textContent = formatTime(audio.duration);
    }
}

function updatePlayerUI() {
    const playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.textContent = data.isPlaying ? '⏸' : '▶';
    }
    
    if (appTitle.textContent === 'Music') {
        loadMusic();
    }
}

function handleAudioError() {
    console.error('Audio loading error');
    alert('Lỗi khi tải file âm thanh. Vui lòng kiểm tra đường dẫn.');
    data.isPlaying = false;
    updatePlayerUI();
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function loadChatCBD() {
    const history = data.chatHistory.map(msg => `
        <div class="message ${msg.role}-message">
            ${escapeHtml(msg.content)}
        </div>
    `).join('');

    appBody.innerHTML = `
        <div class="chat-container">
            <div class="chat-messages" id="chatMessages">
                ${history || '<div class="message bot-message">Xin chào! Tôi là ChatCBD, trợ lý AI của PongbOS. Tôi có thể trò chuyện và hỗ trợ bạn. Hãy gửi tin nhắn cho tôi!</div>'}
            </div>
            <div class="chat-input-area">
                <input type="text" class="chat-input" id="chatInput" placeholder="Nhập tin nhắn...">
                <button onclick="sendMessage()" id="sendButton">Gửi</button>
            </div>
        </div>
    `;

    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    setTimeout(() => {
        const input = document.getElementById('chatInput');
        if (input) input.focus();
    }, 100);
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;

    addChatMessage('user', message);
    input.value = '';
    
    showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator();
        generateAIResponse(message);
    }, 1000 + Math.random() * 2000);
}

function addChatMessage(role, content) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}-message`;
    messageEl.textContent = content;
    
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    data.chatHistory.push({ role, content });
    if (data.chatHistory.length > 50) {
        data.chatHistory = data.chatHistory.slice(-50);
    }
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    hideTypingIndicator();
    
    const typingEl = document.createElement('div');
    typingEl.id = 'typingIndicator';
    typingEl.className = 'typing-indicator';
    typingEl.innerHTML = `
        <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    messagesContainer.appendChild(typingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

function generateAIResponse(message) {
    const responses = [
        "Đó là một câu hỏi thú vị! Tôi nghĩ rằng " + message.toLowerCase() + " là một chủ đề rất đáng để thảo luận.",
        "Cảm ơn bạn đã chia sẻ! Về " + message.toLowerCase() + ", tôi có thể giúp bạn tìm hiểu thêm.",
        "Thật tuyệt! Tôi hiểu bạn đang quan tâm đến " + message.toLowerCase() + ". Bạn muốn biết thêm gì?",
        "Hmm, " + message.toLowerCase() + " là một điều thú vị. Tôi sẽ cố gắng hỗ trợ bạn tốt nhất có thể!",
        "Tôi đã ghi nhận thông tin về " + message.toLowerCase() + ". Có gì khác tôi có thể giúp bạn không?"
    ];
    
    const lowerMessage = message.toLowerCase();
    let response;
    
    if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello')) {
        response = "Xin chào! Rất vui được gặp bạn. Tôi có thể giúp gì cho bạn hôm nay?";
    } else if (lowerMessage.includes('tên')) {
        response = "Tôi là ChatCBD, trợ lý AI được tích hợp trong PongbOS. Tôi được tạo ra để hỗ trợ người dùng!";
    } else if (lowerMessage.includes('thời tiết')) {
        response = "Tôi không thể truy cập dữ liệu thời tiết thời gian thực, nhưng bạn có thể kiểm tra qua ứng dụng Browser!";
    } else if (lowerMessage.includes('pongbos')) {
        response = "PongbOS là một hệ điều hành di động được phát triển bởi PongbCloud. Nó có nhiều tính năng thú vị!";
    } else if (lowerMessage.includes('cảm ơn')) {
        response = "Không có gì! Tôi luôn sẵn sàng giúp đỡ bạn. Còn gì khác tôi có thể hỗ trợ không?";
    } else {
        response = responses[Math.floor(Math.random() * responses.length)];
    }
    
    addChatMessage('bot', response);
    logEvent(`ChatCBD: ${message.substring(0, 30)}...`);
}

function loadCall() {
    const friendsList = data.friends.length > 0 ? data.friends.map((friend, i) => `
        <div class="friend-item">
            <div class="friend-info">
                <div class="friend-name">${escapeHtml(friend.name)}</div>
                <div class="friend-port">Port: ${friend.port}</div>
                <div style="font-size: 12px; color: var(--muted);">
                    ${friend.online ? '🟢 Online' : '🔴 Offline'}
                </div>
            </div>
            <div class="friend-actions">
                <button onclick="initiateCall(${i})" ${!friend.online ? 'disabled' : ''}>📞</button>
                <button onclick="removeFriend(${i})" style="background: #ff4757;">🗑</button>
            </div>
        </div>
    `).join('') : '<div class="empty-state"><div class="icon">👥</div><p>Chưa có bạn bè</p></div>';

    appBody.innerHTML = `
        <div class="call-container">
            <div class="call-section">
                <h3>🆔 Thông tin của bạn</h3>
                <div class="call-id-display">
                    <div>Call ID</div>
                    <div class="call-id">${data.callPort}</div>
                    <button onclick="generateNewCallId()">🔄 Tạo ID mới</button>
                </div>
            </div>

            <div class="call-section">
                <h3>➕ Thêm bạn bè</h3>
                <input type="number" id="friendPort" placeholder="Nhập Call ID của bạn">
                <input type="text" id="friendName" placeholder="Tên hiển thị">
                <button onclick="addFriend()">Thêm bạn</button>
            </div>

            <div class="call-section">
                <h3>👥 Danh sách bạn bè</h3>
                <div class="friends-list">
                    ${friendsList}
                </div>
            </div>

            ${data.callStatus !== 'idle' ? `
                <div class="call-section">
                    <h3>📞 Cuộc gọi</h3>
                    <div class="video-container">
                        <div>Chế độ mô phỏng cuộc gọi</div>
                        <div style="margin-top: 10px;">${getCallStatusText()}</div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button onclick="endCall()" style="background: #ff4757;">📵 Kết thúc</button>
                        ${data.callStatus === 'incoming' ? '<button onclick="acceptCall()" style="background: #2ed573;">✅ Chấp nhận</button>' : ''}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function generateNewCallId() {
    data.callPort = Math.floor(1000 + Math.random() * 9000);
    loadCall();
    logEvent(`Tạo Call ID mới: ${data.callPort}`);
}

function addFriend() {
    const portInput = document.getElementById('friendPort');
    const nameInput = document.getElementById('friendName');
    const port = portInput.value.trim();
    const name = nameInput.value.trim();
    
    if (!port || !name) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
    }
    
    if (port == data.callPort) {
        alert('Không thể thêm chính mình');
        return;
    }
    
    if (data.friends.some(f => f.port == port)) {
        alert('Bạn bè đã tồn tại');
        return;
    }
    
    data.friends.push({ 
        port: parseInt(port), 
        name, 
        online: Math.random() > 0.3
    });
    
    portInput.value = '';
    nameInput.value = '';
    loadCall();
    logEvent(`Thêm bạn bè: ${name} (${port})`);
}

function removeFriend(index) {
    const friend = data.friends[index];
    data.friends.splice(index, 1);
    loadCall();
    logEvent(`Xóa bạn bè: ${friend.name}`);
}

function initiateCall(index) {
    const friend = data.friends[index];
    data.callStatus = 'calling';
    data.currentCall = friend;
    loadCall();
    logEvent(`Gọi cho ${friend.name}`);
    
    setTimeout(() => {
        if (data.callStatus === 'calling') {
            const responses = ['accepted', 'declined', 'no_answer'];
            const response = responses[Math.floor(Math.random() * responses.length)];
            
            switch (response) {
                case 'accepted':
                    data.callStatus = 'connected';
                    break;
                case 'declined':
                    data.callStatus = 'idle';
                    alert('Cuộc gọi bị từ chối');
                    break;
                case 'no_answer':
                    data.callStatus = 'idle';
                    alert('Không có phản hồi');
                    break;
            }
            
            if (appTitle.textContent === 'Call') {
                loadCall();
            }
        }
    }, 3000 + Math.random() * 5000);
}

function acceptCall() {
    data.callStatus = 'connected';
    loadCall();
    logEvent('Chấp nhận cuộc gọi');
}

function endCall() {
    data.callStatus = 'idle';
    data.currentCall = null;
    loadCall();
    logEvent('Kết thúc cuộc gọi');
}

function getCallStatusText() {
    switch (data.callStatus) {
        case 'calling': return '📱 Đang gọi...';
        case 'incoming': return '📞 Cuộc gọi đến';
        case 'connected': return '🔗 Đã kết nối';
        default: return '📱 Sẵn sàng';
    }
}

function loadNotes() {
    const notesList = data.notes.length > 0 ? data.notes.map((note, i) => `
        <div class="note-item">
            <div class="note-content">${escapeHtml(note.content)}</div>
            <div class="note-date">${new Date(note.timestamp).toLocaleString('vi-VN')}</div>
            <div class="note-actions">
                <button onclick="editNote(${i})">✏️ Sửa</button>
                <button onclick="deleteNote(${i})" style="background: #ff4757;">🗑 Xóa</button>
            </div>
        </div>
    `).join('') : '<div class="empty-state"><div class="icon">📝</div><p>Chưa có ghi chú</p></div>';

    appBody.innerHTML = `
        <div class="notes-container">
            <div class="note-editor">
                <textarea id="noteContent" placeholder="Nhập ghi chú mới..."></textarea>
                <button onclick="addNote()">💾 Lưu ghi chú</button>
            </div>
            <div class="notes-list">
                ${notesList}
            </div>
        </div>
    `;
}

function addNote() {
    const content = document.getElementById('noteContent').value.trim();
    if (!content) {
        alert('Vui lòng nhập nội dung ghi chú');
        return;
    }

    data.notes.unshift({
        content,
        timestamp: Date.now(),
        id: Date.now()
    });

    document.getElementById('noteContent').value = '';
    loadNotes();
    logEvent('Thêm ghi chú mới');
}

function editNote(index) {
    const note = data.notes[index];
    const newContent = prompt('Chỉnh sửa ghi chú:', note.content);
    
    if (newContent !== null && newContent.trim()) {
        data.notes[index].content = newContent.trim();
        data.notes[index].timestamp = Date.now();
        loadNotes();
        logEvent('Chỉnh sửa ghi chú');
    }
}

function deleteNote(index) {
    if (confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
        data.notes.splice(index, 1);
        loadNotes();
        logEvent('Xóa ghi chú');
    }
}

function loadSpeedtest() {
    appBody.innerHTML = `
        <div class="speedtest-container">
            <h2>🚀 PongbOS Speedtest</h2>
            <p>Kiểm tra tốc độ mạng thực tế của bạn</p>
            
            <button onclick="runSpeedTest()" id="startTest" style="font-size: 16px; padding: 15px 30px; margin: 20px 0;">
                🎯 Bắt đầu kiểm tra
            </button>

            <div id="testResults" style="display: none;">
                <div class="speed-gauge">
                    <div class="gauge-bg">
                        <div class="gauge-inner">
                            <div class="speed-value" id="speedValue">--</div>
                            <div class="speed-unit">Mbps</div>
                        </div>
                    </div>
                </div>

                <div class="speedtest-metrics">
                    <div class="metric-card">
                        <div class="metric-label">Ping</div>
                        <div class="metric-value" id="pingValue">--</div>
                        <div style="font-size: 12px; color: var(--muted);">ms</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Download</div>
                        <div class="metric-value" id="downloadValue">--</div>
                        <div style="font-size: 12px; color: var(--muted);">Mbps</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Upload</div>
                        <div class="metric-value" id="uploadValue">--</div>
                        <div style="font-size: 12px; color: var(--muted);">Mbps</div>
                    </div>
                </div>

                <div id="performanceAnalysis"></div>
            </div>

            <div id="testLog" style="margin-top: 20px; padding: 15px; background: var(--card); border-radius: 12px; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto;"></div>
        </div>
    `;
}

async function runSpeedTest() {
    const startBtn = document.getElementById('startTest');
    const results = document.getElementById('testResults');
    
    startBtn.disabled = true;
    startBtn.textContent = '🔄 Đang kiểm tra...';
    results.style.display = 'block';
    
    try {
        await testLatency();
        await testDownloadSpeed();
        await testUploadSpeed();
        analyzePerformance();
        
        startBtn.textContent = '✅ Hoàn thành - Chạy lại';
        logEvent('Hoàn thành SpeedTest');
        
    } catch (error) {
        console.error('Speed test error:', error);
        logToSpeedTest('❌ Lỗi khi chạy speed test: ' + error.message);
    }
    
    startBtn.disabled = false;
}

async function testLatency() {
    logToSpeedTest('🔍 Đang kiểm tra độ trễ...');
    
    const testUrls = [
        'https://www.google.com/favicon.ico',
        'https://www.cloudflare.com/favicon.ico',
        'https://www.github.com/favicon.ico'
    ];
    
    let totalLatency = 0;
    let successfulTests = 0;
    
    for (const url of testUrls) {
        try {
            const start = performance.now();
            await fetch(url + '?t=' + Date.now(), { 
                method: 'HEAD', 
                mode: 'no-cors',
                cache: 'no-cache'
            });
            const latency = performance.now() - start;
            totalLatency += latency;
            successfulTests++;
            
            logToSpeedTest(`✅ ${url}: ${Math.round(latency)}ms`);
            
        } catch (error) {
            logToSpeedTest(`❌ ${url}: Thất bại`);
        }
    }
    
    const avgLatency = successfulTests > 0 ? Math.round(totalLatency / successfulTests) : 999;
    document.getElementById('pingValue').textContent = avgLatency;
    
    logToSpeedTest(`📊 Ping trung bình: ${avgLatency}ms`);
}

async function testDownloadSpeed() {
    logToSpeedTest('⬇️ Đang kiểm tra tốc độ tải xuống...');
    
    const testSizes = [100, 500, 1000];
    let totalSpeed = 0;
    let tests = 0;
    
    for (const size of testSizes) {
        try {
            const testUrl = `https://picsum.photos/${Math.sqrt(size * 1000)}/${Math.sqrt(size * 1000)}?random=${Date.now()}`;
            
            const start = performance.now();
            const response = await fetch(testUrl);
            const data = await response.blob();
            const duration = (performance.now() - start) / 1000;
            
            const speedMbps = (data.size * 8) / (duration * 1000000);
            totalSpeed += speedMbps;
            tests++;
            
            logToSpeedTest(`📥 ${size}KB: ${speedMbps.toFixed(2)} Mbps`);
            
        } catch (error) {
            logToSpeedTest(`❌ Test ${size}KB thất bại`);
        }
    }
    
    const avgDownload = tests > 0 ? (totalSpeed / tests).toFixed(2) : 0;
    document.getElementById('downloadValue').textContent = avgDownload;
    document.getElementById('speedValue').textContent = avgDownload;
    
    logToSpeedTest(`📊 Tốc độ download: ${avgDownload} Mbps`);
}

async function testUploadSpeed() {
    logToSpeedTest('⬆️ Mô phỏng kiểm tra tốc độ tải lên...');
    
    const downloadSpeed = parseFloat(document.getElementById('downloadValue').textContent);
    const uploadSpeed = (downloadSpeed * (0.1 + Math.random() * 0.3)).toFixed(2);
    
    document.getElementById('uploadValue').textContent = uploadSpeed;
    logToSpeedTest(`📊 Tốc độ upload (ước tính): ${uploadSpeed} Mbps`);
}

function analyzePerformance() {
    const ping = parseInt(document.getElementById('pingValue').textContent);
    const download = parseFloat(document.getElementById('downloadValue').textContent);
    const upload = parseFloat(document.getElementById('uploadValue').textContent);
    
    const analysis = document.getElementById('performanceAnalysis');
    
    let quality = 'Tốt';
    let recommendations = [];
    
    if (ping > 100) {
        quality = 'Kém';
        recommendations.push('🔴 Độ trễ cao - Không phù hợp cho gaming/video call');
    } else if (ping > 50) {
        quality = 'Trung bình';
        recommendations.push('🟡 Độ trễ hơi cao - Gaming có thể bị ảnh hưởng');
    } else {
        recommendations.push('🟢 Độ trễ thấp - Phù hợp mọi hoạt động');
    }
    
    if (download < 5) {
        quality = 'Kém';
        recommendations.push('🔴 Tốc độ tải chậm - Khó xem video HD');
    } else if (download < 25) {
        recommendations.push('🟡 Đủ cho streaming HD, có thể chậm với 4K');
    } else {
        recommendations.push('🟢 Tốc độ tải xuất sắc - Hỗ trợ 4K và đa tác vụ');
    }
    
    analysis.innerHTML = `
        <div style="margin-top: 20px; padding: 15px; background: var(--card); border-radius: 12px;">
            <h3>📋 Phân tích kết quả</h3>
            <p><strong>Chất lượng kết nối:</strong> ${quality}</p>
            <div style="margin-top: 10px;">
                ${recommendations.map(rec => `<div style="margin: 5px 0;">${rec}</div>`).join('')}
            </div>
        </div>
    `;
    
    logToSpeedTest(`🎯 Đánh giá: ${quality}`);
}

function logToSpeedTest(message) {
    const log = document.getElementById('testLog');
    if (!log) return;
    const timestamp = new Date().toLocaleTimeString();
    log.innerHTML += `[${timestamp}] ${message}<br>`;
    log.scrollTop = log.scrollHeight;
}

function loadSettings() {
    appBody.innerHTML = `
        <div class="settings-section">
            <h3>🎨 Giao diện</h3>
            <div class="color-picker">
                <label>Màu chủ đạo:</label>
                <input type="color" id="accentColor" value="${data.accentColor}">
                <button onclick="updateAccentColor()">Áp dụng</button>
            </div>
        </div>

        <div class="settings-section">
            <h3>💾 Dữ liệu</h3>
            <button onclick="exportData()">📤 Xuất dữ liệu</button>
            <input type="file" id="importFile" accept=".json" style="display:none" onchange="importData(event)">
            <button onclick="document.getElementById('importFile').click()">📥 Nhập dữ liệu</button>
            <button onclick="clearAllData()" style="background: #ff4757;">🗑️ Xóa tất cả dữ liệu</button>
        </div>

        <div class="settings-section">
            <h3>📊 Thống kê</h3>
            <div style="padding: 15px; background: rgba(0,0,0,0.1); border-radius: 8px; margin: 10px 0;">
                <div>📝 Ghi chú: ${data.notes.length}</div>
                <div>🎵 Playlist: ${data.playlist.length} bài</div>
                <div>👥 Bạn bè: ${data.friends.length}</div>
                <div>💬 Tin nhắn chat: ${data.chatHistory.length}</div>
                <div>📋 System logs: ${data.logs.length}</div>
            </div>
        </div>

        <div class="settings-section">
            <h3>🔧 Hệ thống</h3>
            <div style="padding: 15px; background: rgba(0,0,0,0.1); border-radius: 8px; margin: 10px 0;">
                <div><strong>PongbOS</strong> v2.1</div>
                <div>Phát triển bởi <strong>PongbCloud</strong></div>
                <div>Build: ${Date.now().toString().slice(-6)}</div>
            </div>
            
            <button onclick="viewSystemLogs()">📋 Xem system logs</button>
        </div>
    `;
}

function updateAccentColor() {
    const color = document.getElementById('accentColor').value;
    data.accentColor = color;
    document.documentElement.style.setProperty('--accent', color);
    logEvent(`Đổi màu chủ đạo: ${color}`);
    alert('Đã cập nhật màu chủ đạo!');
}

function exportData() {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `pongbos-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    logEvent('Xuất dữ liệu thành công');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (confirm('⚠️ Nhập dữ liệu sẽ ghi đè lên dữ liệu hiện tại. Tiếp tục?')) {
                data.notes = importedData.notes || [];
                data.playlist = importedData.playlist || [];
                data.chatHistory = importedData.chatHistory || [];
                data.friends = importedData.friends || [];
                data.accentColor = importedData.accentColor || '#4ba3ff';
                
                document.documentElement.style.setProperty('--accent', data.accentColor);
                
                alert('✅ Nhập dữ liệu thành công!');
                logEvent('Nhập dữ liệu từ file backup');
                loadSettings();
            }
        } catch (error) {
            alert('❌ Lỗi: File không hợp lệ');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa TẤT CẢ dữ liệu? Hành động này không thể hoàn tác!')) {
        const confirmText = prompt('Gõ "XÓA HẾT" để xác nhận:');
        if (confirmText === 'XÓA HẾT') {
            data = {
                notes: [],
                playlist: [],
                wallpapers: data.wallpapers,
                homeWallpapers: data.homeWallpapers,
                currentWallpaperIndex: 0,
                currentHomeWallpaperIndex: 0,
                accentColor: '#4ba3ff',
                logs: ['System reset by user'],
                currentTrackIndex: -1,
                isPlaying: false,
                chatHistory: [],
                callPort: Math.floor(1000 + Math.random() * 9000),
                friends: [],
                callStatus: 'idle',
                currentAudio: null,
                currentCall: null
            };
            
            document.documentElement.style.setProperty('--accent', data.accentColor);
            alert('✅ Đã xóa tất cả dữ liệu!');
            closeApp();
        }
    }
}

function viewSystemLogs() {
    const logsHtml = data.logs.map(log => `<div>${escapeHtml(log)}</div>`).join('');
    
    appBody.innerHTML = `
        <div>
            <button onclick="loadSettings()" style="margin-bottom: 15px;">← Quay lại Settings</button>
            <h3>📋 System Logs</h3>
            <div style="background: var(--card); padding: 15px; border-radius: 12px; max-height: 400px; overflow-y: auto; font-family: monospace; font-size: 12px;">
                ${logsHtml || '<div>Không có logs</div>'}
            </div>
            <button onclick="clearLogs()" style="background: #ff4757; margin-top: 10px;">Xóa logs</button>
        </div>
    `;
}

function clearLogs() {
    if (confirm('Xóa tất cả system logs?')) {
        data.logs = [];
        viewSystemLogs();
        logEvent('Đã xóa system logs');
    }
}

function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
    });
    const date = now.toLocaleDateString('vi-VN', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    });

    const lockTime = document.getElementById('lock-time');
    const lockDate = document.getElementById('lock-date');
    const statusTime = document.getElementById('status-time');

    if (lockTime) lockTime.textContent = time;
    if (lockDate) lockDate.textContent = date;
    if (statusTime) statusTime.textContent = time;
}

function updateWallpapers() {
    const lockScreen = document.getElementById('lockscreen');
    const homeScreen = document.querySelector('.home');
    
    if (lockScreen && data.wallpapers[data.currentWallpaperIndex]) {
        lockScreen.style.backgroundImage = `linear-gradient(135deg, rgba(0,0,0,0.3), rgba(75,163,255,0.1)), url('${data.wallpapers[data.currentWallpaperIndex]}')`;
    }
    
    if (homeScreen && data.homeWallpapers[data.currentHomeWallpaperIndex]) {
        homeScreen.style.backgroundImage = `linear-gradient(135deg, rgba(0,0,0,0.1), rgba(75,163,255,0.05)), url('${data.homeWallpapers[data.currentHomeWallpaperIndex]}')`;
    }
}

let startY = 0;
let isMouseDown = false;
const lockScreen = document.getElementById('lockscreen');

lockScreen.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
    lockScreen.style.transition = 'none';
});

lockScreen.addEventListener('touchmove', e => {
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    
    if (diff > 0) {
        lockScreen.style.transform = `translateY(-${Math.min(diff, window.innerHeight)}px)`;
    }
});

lockScreen.addEventListener('touchend', e => {
    const currentY = e.changedTouches[0].clientY;
    const diff = startY - currentY;
    
    lockScreen.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
    
    if (diff > 150) {
        lockScreen.classList.add('hidden');
        logEvent('Mở khóa màn hình');
    } else {
        lockScreen.style.transform = 'translateY(0)';
    }
});

lockScreen.addEventListener('mousedown', e => {
    startY = e.clientY;
    isMouseDown = true;
    lockScreen.style.transition = 'none';
    e.preventDefault();
});

document.addEventListener('mousemove', e => {
    if (!isMouseDown || startY === 0 || !lockScreen.classList.contains('hidden') === false) return;
    
    const currentY = e.clientY;
    const diff = startY - currentY;
    
    if (diff > 0 && lockScreen.style.display !== 'none') {
        lockScreen.style.transform = `translateY(-${Math.min(diff, window.innerHeight)}px)`;
    }
});

document.addEventListener('mouseup', e => {
    if (!isMouseDown) return;
    
    const currentY = e.clientY;
    const diff = startY - currentY;
    
    lockScreen.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
    
    if (diff > 150) {
        lockScreen.classList.add('hidden');
        logEvent('Mở khóa màn hình (chuột)');
    } else {
        lockScreen.style.transform = 'translateY(0)';
    }
    
    isMouseDown = false;
    startY = 0;
});

updateTime();
updateWallpapers();
setInterval(updateTime, 1000);

setInterval(() => {
    data.friends.forEach(friend => {
        if (Math.random() < 0.1) {
            friend.online = !friend.online;
        }
    });
}, 10000);

logEvent('PongbOS v2.1 khởi động hoàn tất');