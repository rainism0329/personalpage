/**
 * Main UI Logic
 * 处理导航、翻译、音频系统、光标特效、Preloader以及矩阵雨彩蛋
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. PRELOADER 逻辑 ---
    window.addEventListener('load', () => {
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if(preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }
        }, 2000);
    });

    // --- 2. 移动端导航 & 滚动锁定 ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li a');
    const navOverlay = document.querySelector('.nav-overlay');
    const body = document.body;

    function toggleMenu() {
        if (!navLinks) return;
        navLinks.classList.toggle('nav-active');
        if (navOverlay) navOverlay.classList.toggle('active');
        body.classList.toggle('scroll-locked');
    }

    if (hamburger) hamburger.addEventListener('click', toggleMenu);
    if (navOverlay) navOverlay.addEventListener('click', toggleMenu);

    links.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('nav-active')) {
                toggleMenu();
            }
        });
    });

    // --- 3. SCROLLSPY (导航高亮) ---
    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll(".nav-links a.nav-item");

    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 100) {
                current = section.getAttribute("id");
            }
        });

        navItems.forEach((li) => {
            li.classList.remove("active");
            if (li.getAttribute("href").includes(current)) {
                li.classList.add("active");
            }
        });
    });

    // --- 4. AUDIO SYSTEM (音频) ---
    const bgm = document.getElementById('bgm');
    const sfxHover = document.getElementById('sfx-hover');
    const audioToggle = document.querySelector('.audio-toggle');
    let isAudioPlaying = false;

    if (bgm) bgm.volume = 0.3;
    if (sfxHover) sfxHover.volume = 0.2;

    // 将 toggleAudio 挂载到 window 对象以便 HTML onclick 调用
    window.toggleAudio = function() {
        if (!bgm || !audioToggle) return;

        if (isAudioPlaying) {
            bgm.pause();
            audioToggle.classList.remove('playing');
            audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            bgm.play().catch(e => console.log("Interaction required"));
            audioToggle.classList.add('playing');
            audioToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
        isAudioPlaying = !isAudioPlaying;
    };

    document.querySelectorAll('a, button, .card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (isAudioPlaying && sfxHover) {
                sfxHover.currentTime = 0;
                sfxHover.play().catch(() => {});
            }
        });
    });

    // --- 5. I18N TRANSLATIONS (国际化) ---
    const translations = {
        en: {
            nav_home: "Start", nav_about: "Profile", nav_work: "Work", nav_plugins: "Plugins", nav_game: "Merge Hell",
            hero_intro: "// Hello World, I am",
            hero_desc: "Crafting robust backend systems and navigating through complex architectures in the digital frontier.",
            hero_btn: "View Profile",
            about_title: "System Stats", profile_title: "Profile",
            label_role: "Role:", val_role: "Senior Software Engineer",
            label_edu: "Education:", val_edu: "MSc Computer Science, Univ. of Leicester",
            label_focus: "Focus:", val_focus: "High-performance Backend, Cloud Architecture",
            label_curr: "Current:", val_curr: "Fortune 500 Financial Institution",
            stack_title: "Tech Stack",
            projects_title: "Deployed Builds",
            p1_title: "Enterprise Monitor", p1_client: "Fortune 500 Finance Firm",
            p1_desc: "Engineered a critical file monitoring system handling massive data flow. Led the migration to HDFS and optimized SLA alerting mechanisms.",
            p2_title: "Unified Data Platform", p2_client: "Risk & Compliance Dept",
            p2_desc: "Developed the 'Reference Data Service' module. Implemented Git-based version control for business data, ensuring auditability and safe rollback.",
            p3_title: "Core Insurance System", p3_client: "Global Tech Firm",
            p3_desc: "Customized a next-gen insurance administration solution. Bridged technical requirements between Shanghai and US teams, optimizing the base architecture.",
            plugins_title: "Neural Extensions",
            pl_title: "IntelliJ IDEA Plugins",
            pl_desc: "Enhancing developer productivity with custom tools and utilities for the JetBrains ecosystem.",
            pl_btn: "Visit Vendor Profile",
            game_warning: "> SYSTEM OVERLOAD. INITIATING SEQUENCE...",
            game_break: "Break Time:",
            game_desc: "> Avoid Bugs. Commit Fixes. Defeat Legacy Code.",
            key_move: "Move", key_jump: "Jump", key_shoot: "Shoot (Commit)",
            btn_run: "Run 'Main'", btn_rebuild: "Rebuild Project",
            go_title: "BUILD FAILED", go_score: "Final Score:",
            lc_title: "LEVEL COMPLETE",
            hud_lines: "Lines:",
            footer_text: "No Bugs, Just Features.",
            fuel_status: "RECHARGE",
            mob_donate_label: ">>> MOBILE RECHARGE UNIT",
            typed_strings: ['Java Backend Expert', 'System Architect', 'Legacy Code Slayer']
        },
        zh: {
            nav_home: "首页", nav_about: "简介", nav_work: "项目", nav_plugins: "插件", nav_game: "代码地狱",
            hero_intro: "// 你好世界，我是",
            hero_desc: "在数字前沿构建稳健的后端系统，驾驭复杂的架构设计。",
            hero_btn: "查看详情",
            about_title: "系统状态", profile_title: "个人档案",
            label_role: "职位:", val_role: "高级软件工程师",
            label_edu: "教育:", val_edu: "莱斯特大学 高级计算机科学硕士",
            label_focus: "专注:", val_focus: "高性能后端, 云原生架构",
            label_curr: "当前:", val_curr: "世界500强金融机构",
            stack_title: "技术栈",
            projects_title: "已部署项目",
            p1_title: "企业级监控系统", p1_client: "世界500强金融企业",
            p1_desc: "设计了处理海量数据流的核心文件监控系统。主导了向 HDFS 的迁移并优化了 SLA 警报机制。",
            p2_title: "统一数据平台", p2_client: "风险与合规部门",
            p2_desc: "开发了'参考数据服务'模块。实现了基于 Git 的业务数据版本控制，确保可审计性和安全回滚。",
            p3_title: "核心保险系统", p3_client: "全球科技服务公司",
            p3_desc: "定制开发下一代保险管理解决方案。衔接上海与美国团队的技术需求，优化底层架构。",
            plugins_title: "神经扩展 (Plugins)",
            pl_title: "IntelliJ IDEA 插件集",
            pl_desc: "为 JetBrains 生态系统打造的自定义工具，旨在提升开发者的编码效率与体验。",
            pl_btn: "访问开发者主页",
            game_warning: "> 系统过载。启动防御序列...",
            game_break: "休息一下:",
            game_desc: "> 躲避 Bug。提交修复。击败祖传代码。",
            key_move: "移动", key_jump: "跳跃", key_shoot: "射击 (Commit)",
            btn_run: "运行 'Main'", btn_rebuild: "重新构建项目",
            go_title: "构建失败", go_score: "最终得分:",
            lc_title: "关卡完成",
            hud_lines: "代码行数:",
            footer_text: "没有 Bug，只有特性。",
            fuel_status: "能量补给",
            mob_donate_label: ">>> 移动端充能站",
            typed_strings: ['Java 后端专家', '系统架构师', '祖传代码终结者']
        }
    };

    let currentLang = localStorage.getItem('site_lang') || 'en';
    let typedInstance = null;

    function updateLanguage(lang) {
        const t = translations[lang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                if (el.classList.contains('donate-btn')) {
                    const icon = el.querySelector('i');
                    const span = el.querySelector('span');
                    if(span) span.innerText = t[key];
                } else if (el.children.length > 0 && el.tagName !== 'BUTTON') {
                    const icon = el.querySelector('i');
                    el.innerText = t[key];
                    if(icon) el.prepend(icon);
                } else {
                    el.innerText = t[key];
                }
            }
        });

        // 更新 Typed.js
        if (document.getElementById('typed-text')) {
            if (typedInstance) typedInstance.destroy();
            typedInstance = new Typed('#typed-text', {
                strings: t.typed_strings,
                typeSpeed: 50, backSpeed: 30, loop: true
            });
        }
        localStorage.setItem('site_lang', lang);
    }

    // 挂载切换语言函数
    window.toggleLanguage = function() {
        currentLang = currentLang === 'en' ? 'zh' : 'en';
        updateLanguage(currentLang);
    };

    // 初始化外部库
    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, offset: 50 });
    if (typeof particlesJS !== 'undefined') {
        particlesJS("particles-js", {
            "particles": { "number": { "value": 60 }, "color": { "value": ["#00fff2", "#bd00ff"] }, "shape": { "type": "circle" }, "opacity": { "value": 0.6 }, "size": { "value": 2 }, "line_linked": { "enable": true, "distance": 150, "color": "#45a29e", "opacity": 0.2, "width": 1 }, "move": { "enable": true, "speed": 1.5 } },
            "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" } } }
        });
    }

    updateLanguage(currentLang);

    // --- 6. MOUSE CURSOR (光标特效) ---
    const cursorDot = document.getElementById("cursor-dot");
    const cursorRing = document.getElementById("cursor-ring");

    if (cursorDot && cursorRing) {
        let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        function animateCursor() {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        document.addEventListener("mousedown", () => { document.body.classList.add("clicking"); });
        document.addEventListener("mouseup", () => { document.body.classList.remove("clicking"); });

        document.querySelectorAll("a, button, .card, .game-btn, .fuel-btn").forEach(link => {
            link.addEventListener("mouseenter", () => { document.body.classList.add("hover-link"); });
            link.addEventListener("mouseleave", () => { document.body.classList.remove("hover-link"); });
        });

        const gameArea = document.getElementById("game");
        if (gameArea) {
            gameArea.addEventListener("mouseenter", () => { document.body.classList.add("hover-danger"); });
            gameArea.addEventListener("mouseleave", () => { document.body.classList.remove("hover-danger"); });
        }
    }

    // --- 7. CONSOLE EASTER EGG & SYSTEM TIME ---
    const styleTitle = [
        'font-size: 20px', 'font-weight: bold', 'font-family: monospace',
        'color: #00fff2', 'text-shadow: 0 0 10px #00fff2', 'padding: 10px 0',
    ].join(';');

    const styleBody = [
        'font-size: 12px', 'font-family: monospace', 'color: #bd00ff',
    ].join(';');

    console.log('%c⚡ SYSTEM READY // PHIL_PORTFOLIO_V10.0', styleTitle);
    console.log('%c> Welcome to the backend. Looking for bugs? Good luck.', styleBody);
    console.log('%c> Connect with me: https://github.com/rainism0329', styleBody);

    let docTitle = document.title;
    window.addEventListener("blur", () => { document.title = "⚠ SIGNAL LOST // Come Back"; });
    window.addEventListener("focus", () => { document.title = docTitle; });

    function updateTime() {
        const timeEl = document.getElementById('local-time');
        if (timeEl) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
            timeEl.innerText = `SYS_TIME: ${timeString} [UTC+8]`;
        }
        requestAnimationFrame(updateTime);
    }
    updateTime();

    // --- 8. KONAMI CODE & MATRIX RAIN ---
    const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
    let konamiIndex = 0;
    const matrixCanvas = document.getElementById('matrix-canvas');
    let mCtx = matrixCanvas ? matrixCanvas.getContext('2d') : null;
    let matrixInterval;

    if (matrixCanvas && mCtx) {
        window.addEventListener('keydown', (e) => {
            // ESC to exit Matrix Mode
            if (e.code === 'Escape' && matrixCanvas.classList.contains('active')) {
                deactivateMatrix();
            }

            // Check Konami sequence
            if (e.code === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    activateMatrix();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });

        window.addEventListener('resize', () => {
            if (matrixCanvas.classList.contains('active')) {
                matrixCanvas.width = window.innerWidth;
                matrixCanvas.height = window.innerHeight;
                if (matrixInterval) clearInterval(matrixInterval);
                startMatrixAnimation(16);
            }
        });
    }

    function activateMatrix() {
        if (!matrixCanvas || matrixCanvas.classList.contains('active')) return;

        console.log('%c>>> MATRIX MODE ACTIVATED <<<', 'color:#0f0; font-size:20px; font-weight:bold;');

        matrixCanvas.classList.add('active');
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        startMatrixAnimation(16);

        // Play BGM if not already playing
        const bgm = document.getElementById('bgm');
        if(bgm && bgm.paused) bgm.play().catch(()=>{});
    }

    function deactivateMatrix() {
        if (!matrixCanvas) return;
        matrixCanvas.classList.remove('active');
        if (matrixInterval) clearInterval(matrixInterval);
        mCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }

    function startMatrixAnimation(fontSize) {
        if (!mCtx) return;
        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const columns = matrixCanvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        function drawMatrix() {
            mCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            mCtx.fillStyle = '#0F0';
            mCtx.font = fontSize + 'px monospace';

            for(let i = 0; i < drops.length; i++) {
                const text = katakana.charAt(Math.floor(Math.random() * katakana.length));
                mCtx.fillText(text, i*fontSize, drops[i]*fontSize);

                if(drops[i]*fontSize > matrixCanvas.height && Math.random() > 0.975)
                    drops[i] = 0;
                drops[i]++;
            }
        }

        if (matrixInterval) clearInterval(matrixInterval);
        matrixInterval = setInterval(drawMatrix, 30);
    }
});