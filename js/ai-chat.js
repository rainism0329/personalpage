/**
 * Simulated AI Chat Assistant (Dual Contact Channel & Multi-Language)
 */

document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('ai-chat-window');
    const messagesArea = document.getElementById('ai-messages-area');
    const optionsArea = document.getElementById('ai-options-area');
    let hasInitialized = false;

    // --- 1. 多语言语料库 (新增了 btn_form) ---
    const aiData = {
        en: {
            connecting: "Establishing encrypted connection... [OK]",
            welcome: "Identity confirmed. I am Phil's digital twin. How can I assist you?",
            opt_hiring: "💼 Hiring / Collab",
            opt_stack: "💻 Tech Stack",
            opt_donate: "⚡ Recharge System",
            opt_chat: "☕ Just Chatting",

            resp_hiring: "Phil is currently focused on <strong>High-Frequency Trading</strong> and <strong>Cloud-Native Architecture</strong>.<br>You can send a direct email or leave a secure message.",
            btn_email: "📧 Send Email (Direct)",   // [保留] 直接发邮件
            btn_form: "📡 Secure Message (Form)", // [新增] 在线留言表单
            btn_back: "🔙 Back to Terminal",

            resp_donate: "Energy transfer request detected. Please select a protocol:<br>Your support powers the next commit.",

            resp_stack: "Loading core arsenal data...<br>> <strong>Java / Spring Boot</strong> [Mastery]<br>> <strong>K8s / Docker</strong> [Native]<br>> <strong>IntelliJ Plugin</strong> [Expert]",
            btn_github: "🐙 Access GitHub",

            resp_chat: "Beep Boop... 🤖<br>Phil enjoys Cyberpunk literature, coffee, and late-night builds.<br>If you are in Shanghai, maybe initiate an offline session?",
            btn_coffee: "☕ Coffee Invite (Email)",

            resp_contact_open: "Secure channel established.<br>Please input your data packet in the overlay window.",

            resp_menu: "Command reset. Awaiting input..."
        },
        zh: {
            connecting: "正在建立加密连接... [OK]",
            welcome: "访客身份已确认。我是 Phil 的数字分身。需要导航协助吗？",
            opt_hiring: "💼 招聘/合作",
            opt_stack: "💻 技术栈",
            opt_donate: "⚡ 为系统充能",
            opt_chat: "☕ 随便聊聊",

            resp_hiring: "Phil 目前专注于 <strong>高频交易架构</strong> 与 <strong>云原生方案</strong>。<br>您可以选择直接发送邮件，或通过加密通道留言。",
            btn_email: "📧 发送邮件 (直接)",     // [保留] 直接发邮件
            btn_form: "📡 加密留言 (表单)",     // [新增] 在线留言表单
            btn_back: "🔙 返回终端",

            resp_donate: "检测到能量传输请求。请选择传输协议：<br>您的支持是系统运行的燃料。",

            resp_stack: "核心武器库数据加载中...<br>> <strong>Java / Spring Boot</strong> [精通]<br>> <strong>K8s / Docker</strong> [原生]<br>> <strong>IntelliJ Plugin</strong> [专家]",
            btn_github: "🐙 访问 GitHub",

            resp_chat: "Beep Boop... 🤖<br>Phil 喜欢赛博朋克文学、咖啡和深夜的代码构建。<br>如果你也在上海，也许可以发起线下会话。",
            btn_coffee: "☕ 约咖啡 (邮件)",

            resp_contact_open: "安全通道已建立。<br>请在弹出的界面中输入数据包。",

            resp_menu: "指令已重置。等待输入..."
        }
    };

    function getLang() {
        return localStorage.getItem('site_lang') || 'en';
    }

    // 添加 CRT 扫描线
    const scanline = document.createElement('div');
    scanline.className = 'crt-lines';
    chatWindow.appendChild(scanline);

    window.toggleAIChat = function() {
        chatWindow.classList.toggle('hidden');

        if (!chatWindow.classList.contains('hidden') && !hasInitialized) {
            hasInitialized = true;
            const t = aiData[getLang()];

            setTimeout(() => {
                botType(t.connecting);
            }, 400);
            setTimeout(() => {
                botType(t.welcome, getMenuOptions(t));
            }, 1200);
        }
    };

    function getMenuOptions(t) {
        return [
            { label: t.opt_hiring, value: "hiring" },
            { label: t.opt_stack, value: "stack" },
            { label: t.opt_donate, value: "donate" },
            { label: t.opt_chat, value: "chat" }
        ];
    }

    window.handleOption = function(value, label) {
        addMessage(label, 'user');
        clearOptions();
        showTypingIndicator();

        const lang = getLang();
        const t = aiData[lang];

        setTimeout(() => {
            removeTypingIndicator();
            let responseText = "";
            let nextOptions = [];

            switch(value) {
                case "hiring":
                    responseText = t.resp_hiring;
                    nextOptions = [
                        // [修改] 同时提供两种方式
                        { label: t.btn_email, action: "mailto:bigphil.zhang@qq.com" },
                        { label: t.btn_form, value: "open_contact" },
                        { label: t.btn_back, value: "menu" }
                    ];
                    break;

                case "donate":
                    responseText = t.resp_donate + "<br><br>" +
                        "<a href='https://www.paypal.com/paypalme/bigphilzhang' target='_blank' class='ai-donate-btn paypal'><i class='fab fa-paypal'></i> PayPal</a>" +
                        "<a href='https://ko-fi.com/philipzhang51603' target='_blank' class='ai-donate-btn kofi'><i class='fas fa-mug-hot'></i> Ko-fi</a>";
                    nextOptions = [
                        { label: t.btn_back, value: "menu" }
                    ];
                    break;

                case "stack":
                    responseText = t.resp_stack;
                    nextOptions = [
                        { label: t.btn_github, action: "https://github.com/rainism0329" },
                        { label: t.btn_back, value: "menu" }
                    ];
                    break;

                case "chat":
                    responseText = t.resp_chat;
                    nextOptions = [
                        // [修改] 闲聊也可以选留言或邮件
                        { label: t.btn_coffee, action: "mailto:bigphil.zhang@qq.com" },
                        { label: t.btn_form, value: "open_contact" },
                        { label: t.btn_back, value: "menu" }
                    ];
                    break;

                // [新增] 处理打开联系人表单的逻辑
                case "open_contact":
                    if (window.toggleContact) {
                        window.toggleContact(); // 调用 main.js 里的函数
                        responseText = t.resp_contact_open;
                    } else {
                        responseText = "Error: Contact module not loaded.";
                    }
                    // 打开表单后，AI 给个“返回菜单”的选项，或者什么都不给也可以
                    nextOptions = [
                        { label: t.btn_back, value: "menu" }
                    ];
                    break;

                case "menu":
                    responseText = t.resp_menu;
                    nextOptions = getMenuOptions(t);
                    break;
            }

            botType(responseText, nextOptions);

        }, 600 + Math.random() * 400);
    };

    // --- Helpers ---

    function addMessage(html, sender) {
        const row = document.createElement('div');
        row.className = `msg-row ${sender}`;
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.innerHTML = html;
        row.appendChild(bubble);
        messagesArea.appendChild(row);
        scrollToBottom();

        const sfx = document.getElementById('sfx-hover');
        if(sfx && sender === 'bot') {
            sfx.currentTime=0;
            sfx.volume = 0.1;
            sfx.play().catch(()=>{});
        }
    }

    function botType(text, options = []) {
        addMessage(text, 'bot');
        if (options.length > 0) {
            showOptions(options);
        }
    }

    function showOptions(options) {
        optionsArea.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'ai-option-btn';
            btn.innerText = opt.label;

            btn.onclick = () => {
                if (opt.action) {
                    if (opt.action.startsWith('http') || opt.action.startsWith('mailto')) {
                        window.open(opt.action, '_blank');
                    }
                } else {
                    handleOption(opt.value, opt.label);
                }
            };
            optionsArea.appendChild(btn);
        });
    }

    function clearOptions() {
        optionsArea.innerHTML = '';
    }

    function showTypingIndicator() {
        const id = 'typing-indicator';
        if (document.getElementById(id)) return;
        const row = document.createElement('div');
        row.className = 'msg-row bot';
        row.id = id;
        row.innerHTML = `<div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
        messagesArea.appendChild(row);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    }

    function scrollToBottom() {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
});