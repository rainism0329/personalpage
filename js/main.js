/**
 * Main UI Logic
 * 处理导航、翻译、音频系统、光标特效、Preloader、矩阵雨彩蛋 以及 职业生涯时间轴特效
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. PRELOADER 逻辑 (带 2000ms 强制等待版) ---
    const hidePreloader = () => {
        const preloader = document.getElementById('preloader');
        if (preloader && preloader.style.display !== 'none') {
            preloader.style.transition = 'opacity 0.5s ease';
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                // 只有在 preloader 消失后，才允许 body 滚动
                document.body.classList.remove('scroll-locked');
            }, 500);
        }
    };

// 场景 A: 资源加载完成 -> 强制展示 2秒 动画 -> 进入系统
    window.addEventListener('load', () => {
        console.log(">> SYSTEM_READY: Resources loaded. Initiating boot sequence...");
        setTimeout(() => {
            hidePreloader();
        }, 2000); // <--- 这里就是你要的 2秒 延迟
    });

// 场景 B: 安全熔断机制
// 既然要强制等 2秒，那兜底时间最好也延长一点 (5s -> 7s)
// 这样即使网络稍慢，也不会因为熔断而突然打断你的开机动画
    setTimeout(() => {
        if (document.getElementById('preloader').style.display !== 'none') {
            console.warn(">> SYSTEM_WARN: Loading timeout. Forcing boot sequence...");
            hidePreloader();
        }
    }, 7000);

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

    // --- 5. I18N TRANSLATIONS (统一标准版) ---
    const translations = {
        en: {
            // [Nav]
            nav_home: "Start",
            nav_about: "Status",
            nav_exp: "Logs",
            nav_work: "Builds",
            nav_plugins: "Exts",
            nav_game: "Game",

            // [Titles]
            hero_intro: "// Hello World, I am",
            // 在 translations.en 中
            hero_desc: "Standing at the event horizon of financial mega-structures, reversing entropy with architectural precision to forge absolute order from chaos; diving into the neural endings of dev-tools to recode the genetic sequence of programming itself. I exist in the quantum superposition of industrial robustness and radical art —— serving as both the alloy backbone of the capital matrix and the lightsaber piercing through mediocrity.",
            hero_btn: "View Profile",

            about_title: "System Status",
            profile_title: "Profile",
            stack_title: "Tech Stack",
            exp_title: "Execution Logs",
            projects_title: "Deployed Builds",
            plugins_title: "Neural Extensions",

            // [Profile Info]
            label_role: "Role:", val_role: "Lead Software Engineer",
            label_edu: "Education:", val_edu: "MSc Computer Science, Univ. of Leicester",
            label_focus: "Focus:", val_focus: "High-performance Backend, Cloud Architecture",
            label_curr: "Current:", val_curr: "Top-Tier Investment Bank",
            profile_verified: "VERIFIED",
            btn_id_card: "GENERATE ACCESS PASS",

            // [Experience - UPDATED]
            exp_role_1: "Lead Software Engineer",
            exp_comp_1: "Top-Tier Investment Bank",
            // [修改点] 英文描述：Credit Risk, Real-time Exposure, High-performance grid
            exp_desc_1: "Spearheading the engineering of mission-critical Credit Risk Management infrastructure. Orchestrating high-performance computing grids for real-time counterparty exposure analysis and stress testing, ensuring institutional resilience.",

            exp_role_2: "Senior Software Engineer",
            exp_comp_2: "Fortune 500 Banking Group",
            exp_desc_2: "Architected critical file monitoring tools (AutoWatch Plus) and unified data platforms. Led code refactoring, JDK upgrades, and legacy system modernization for the GFT department.",

            exp_role_3: "Software Automation Engineer",
            exp_comp_3: "Global Tech Solution Provider",
            exp_desc_3: "Spearheaded the customization of the GIAS insurance solution for North American clients. Facilitated agile development and cross-border communication as a core technical liaison.",

            exp_role_edu: "MSc Computer Science",
            exp_comp_edu: "University of Leicester",
            exp_desc_edu: "Specialized in Advanced Computer Science. Developed a mobile web-based ontology editor for semantic web applications.",

            // [Projects]
            p1_title: "Enterprise Monitor", p1_client: "Fortune 500 Finance Firm",
            p1_desc: "Engineered a critical file monitoring system handling massive data flow. Led the migration to HDFS and optimized SLA alerting mechanisms.",
            p2_title: "Unified Data Platform", p2_client: "Risk & Compliance Dept",
            p2_desc: "Developed the 'Reference Data Service' module. Implemented Git-based version control for business data, ensuring auditability and safe rollback.",
            p3_title: "Core Insurance System", p3_client: "Global Tech Firm",
            p3_desc: "Customized a next-gen insurance administration solution. Bridged technical requirements between Shanghai and US teams, optimizing the base architecture.",

            pl_title: "IntelliJ IDEA Plugins",
            pl_desc: "Enhancing developer productivity with custom tools and utilities for the JetBrains ecosystem.",
            pl_btn: "Visit Vendor Profile",

            // [Game & Misc]
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
            // [Nav]
            nav_home: "启动",
            nav_about: "状态",
            nav_exp: "日志",
            nav_work: "构建",
            nav_plugins: "扩展",
            nav_game: "游戏",

            // [Titles]
            hero_intro: "// 你好世界，我是",
            // 在 translations.zh 中
            hero_desc: "伫立于金融巨构的事件视界，以精密架构逆转熵增，于数字混沌中重铸秩序；深潜至开发工具的神经中枢，重构编程的基因序列。游走于‘工业级稳健’与‘激进艺术’的量子叠加态 —— 既是支撑资本矩阵的合金脊梁，亦是斩破平庸的锋利光剑。",
            hero_btn: "查看档案",

            about_title: "系统状态 (SYSTEM_STATUS)",
            profile_title: "个人档案 (PROFILE)",
            stack_title: "技术栈 (TECH_STACK)",
            exp_title: "执行日志 (EXECUTION_LOGS)",
            projects_title: "已部署构建 (DEPLOYED_BUILDS)",
            plugins_title: "神经扩展 (NEURAL_EXTENSIONS)",

            // [Profile Info]
            // [修改点] 将“首席”改为“资深”
            label_role: "职位:", val_role: "资深软件工程师 (Lead)",
            label_edu: "教育:", val_edu: "莱斯特大学 高级计算机科学硕士",
            label_focus: "专注:", val_focus: "高性能后端, 云原生架构",
            label_curr: "当前:", val_curr: "顶级投资银行",
            profile_verified: "已认证",
            btn_id_card: "生成访客通行证",

            // [Experience - UPDATED]
            // [修改点] 职位改为“资深”，描述改为风控相关
            exp_role_1: "资深软件工程师",
            exp_comp_1: "顶级投资银行",
            exp_desc_1: "主导核心信用风险（Credit Risk）管控基础设施的架构研发。构建高性能计算网格以支持实时交易对手风险敞口分析与压力测试，通过云原生分布式架构保障金融机构在极端市场环境下的资本韧性。",

            exp_role_2: "高级软件工程师",
            exp_comp_2: "世界500强银行集团",
            exp_desc_2: "设计了关键文件监控工具 (AutoWatch Plus) 及统一数据平台。领导了 GFT 部门的代码重构、JDK 升级及遗留系统现代化改造。",

            exp_role_3: "软件自动化工程师",
            exp_comp_3: "全球技术解决方案提供商",
            exp_desc_3: "主导了北美客户 GIAS 保险解决方案的定制化开发。作为核心技术联络人，推动敏捷开发及跨国团队沟通。",

            exp_role_edu: "高级计算机科学硕士",
            exp_comp_edu: "英国莱斯特大学",
            exp_desc_edu: "主修高级计算机科学。开发了用于语义网应用的移动端本体编辑器。",

            // [Projects]
            p1_title: "企业级监控系统", p1_client: "世界500强金融企业",
            p1_desc: "设计了处理海量数据流的核心文件监控系统。主导了向 HDFS 的迁移并优化了 SLA 警报机制。",
            p2_title: "统一数据平台", p2_client: "风险与合规部门",
            p2_desc: "开发了'参考数据服务'模块。实现了基于 Git 的业务数据版本控制，确保可审计性和安全回滚。",
            p3_title: "核心保险系统", p3_client: "全球科技服务公司",
            p3_desc: "定制开发下一代保险管理解决方案。衔接上海与美国团队的技术需求，优化底层架构。",

            pl_title: "IntelliJ IDEA 插件集",
            pl_desc: "为 JetBrains 生态系统打造的自定义工具，旨在提升开发者的编码效率与体验。",
            pl_btn: "访问开发者主页",

            // [Game & Misc]
            game_warning: "> 系统过载。启动防御序列...",
            game_break: "系统过载 (SYSTEM_OVERLOAD)",
            game_desc: "> 躲避 Bug。提交修复。击败祖传代码。",
            key_move: "移动", key_jump: "跳跃", key_shoot: "射击 (Commit)",
            btn_run: "运行 'Main'", btn_rebuild: "重新构建项目",
            go_title: "构建失败", go_score: "最终得分:",
            lc_title: "关卡完成",
            hud_lines: "代码行数:",
            footer_text: "没有 Bug，只有特性。",
            fuel_status: "能量补给",
            mob_donate_label: ">>> 移动端充能站",

            typed_strings: ['Java Backend Expert', 'System Architect', 'Legacy Code Slayer']
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
                    if (icon) {
                        const iconHtml = icon.outerHTML;
                        el.innerHTML = iconHtml + ' ' + t[key];
                    } else {
                        el.innerText = t[key];
                    }
                } else {
                    el.innerText = t[key];
                }
            }
        });

        if (document.getElementById('typed-text')) {
            if (typedInstance) typedInstance.destroy();
            typedInstance = new Typed('#typed-text', {
                strings: t.typed_strings,
                typeSpeed: 50, backSpeed: 30, loop: true
            });
        }
        localStorage.setItem('site_lang', lang);
    }

    window.toggleLanguage = function() {
        currentLang = currentLang === 'en' ? 'zh' : 'en';
        updateLanguage(currentLang);
    };

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

        // [修改] 加入了 .tl-content 以便光标识别
        document.querySelectorAll("a, button, .card, .game-btn, .fuel-btn, .tl-content, .timeline-item").forEach(link => {
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
            if (e.code === 'Escape' && matrixCanvas.classList.contains('active')) {
                deactivateMatrix();
            }
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

    // --- 9. EXPERIENCE TIMELINE ANIMATION (时间轴充能动效) ---
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineProgress = document.querySelector('.timeline-line-progress');
    const timelineItems = document.querySelectorAll('.timeline-item');

    if (timelineContainer && timelineProgress && timelineItems.length > 0) {
        window.addEventListener('scroll', () => {
            const containerRect = timelineContainer.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            const triggerPoint = windowHeight * 0.7;
            const containerTop = containerRect.top;
            const containerHeight = containerRect.height;

            let progress = (triggerPoint - containerTop);

            if (progress < 0) progress = 0;
            if (progress > containerHeight) progress = containerHeight;

            timelineProgress.style.height = `${progress}px`;

            timelineItems.forEach(item => {
                const itemTop = item.getBoundingClientRect().top;
                if (itemTop < triggerPoint) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        });
    }

    // --- 10. CONTACT FORM HANDLING (新增：留言系统) ---
    const contactOverlay = document.getElementById('contact-overlay');
    const contactForm = document.getElementById('cyber-form');
    const formStatus = document.getElementById('form-status');

    // 全局函数：切换显示
    window.toggleContact = function() {
        contactOverlay.classList.toggle('active');
        if(contactOverlay.classList.contains('active')) {
            formStatus.innerText = ""; // 重置状态
            contactForm.reset();
        }
    };

    // AJAX 提交表单 (不跳转页面)
    if (contactForm) {
        contactForm.addEventListener("submit", function(event) {
            event.preventDefault(); // 阻止默认跳转
            const data = new FormData(event.target);
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;

            btn.innerText = "TRANSMITTING...";
            btn.disabled = true;

            fetch(event.target.action, {
                method: contactForm.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    formStatus.innerHTML = "<span style='color:#50fa7b'>>> SUCCESS: MESSAGE UPLOADED.</span>";
                    contactForm.reset();
                    setTimeout(() => toggleContact(), 2000); // 2秒后自动关闭
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            formStatus.innerHTML = `<span style='color:#ff5555'>>> ERROR: ${data["errors"].map(error => error["message"]).join(", ")}</span>`;
                        } else {
                            formStatus.innerHTML = "<span style='color:#ff5555'>>> ERROR: TRANSMISSION FAILED.</span>";
                        }
                    });
                }
            }).catch(error => {
                formStatus.innerHTML = "<span style='color:#ff5555'>>> NET_ERR: CONNECTION LOST.</span>";
            }).finally(() => {
                btn.innerText = originalText;
                btn.disabled = false;
            });
        });
    }

    // --- 10. SKILL RADAR CHART (赛博朋克技能雷达图) ---
    const radarCanvas = document.getElementById('skillRadarChart');
    if (radarCanvas && typeof Chart !== 'undefined') {
        const ctx = radarCanvas.getContext('2d');

        // 赛博朋克配色定义
        const cyan = '#00fff2';
        const purple = '#bd00ff';
        const darkBg = 'rgba(10, 10, 15, 0.9)';
        const font = "'JetBrains Mono', monospace"; // 使用等宽字体

        // 数据配置 (根据你的资深人设预设)
        // 维度建议用英文，在雷达图上看起来更简洁专业
        const data = {
            // 这里的标签对应那 6 个技能标签，尽量简写以适应图表显示
            labels: ['Java / JVM', 'Spring Boot', 'Microservices', 'Kafka / MQ', 'Docker / K8s', 'Oracle / SQL'],
            datasets: [{
                label: 'Proficiency',
                // 资深专家的数值设定 (Java给最高)
                data: [98, 95, 92, 88, 85, 90],
                backgroundColor: 'rgba(0, 255, 242, 0.2)',
                borderColor: cyan,
                borderWidth: 2,
                pointBackgroundColor: cyan,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: cyan,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.1
            }]
        };

        // 图表配置选项
        const config = {
            type: 'radar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false, // 允许自适应容器高度
                scales: {
                    r: {
                        // ★★★ 强制锁定刻度范围 0-100 ★★★
                        min: 0,
                        max: 100,

                        angleLines: {
                            color: 'rgba(0, 255, 242, 0.15)'
                        },
                        grid: {
                            color: 'rgba(0, 255, 242, 0.15)',
                            circular: true
                        },
                        pointLabels: {
                            color: '#ccc',
                            font: { family: font, size: 11, weight: 'bold' }
                        },
                        ticks: {
                            display: false, // 隐藏刻度数字
                            stepSize: 20    // 保持网格密度
                        }
                    }
                },
                plugins: {
                    // 隐藏图例 (不需要显示 "Proficiency")
                    legend: { display: false },
                    // 提示框配置 (鼠标放上去显示数值)
                    tooltip: {
                        backgroundColor: darkBg,
                        titleColor: cyan,
                        bodyColor: '#fff',
                        titleFont: { family: font, size: 14 },
                        bodyFont: { family: font, size: 13 },
                        borderColor: cyan,
                        borderWidth: 1,
                        displayColors: false, // 不显示颜色小方块
                        padding: 10,
                        callbacks: {
                            // 自定义提示文字格式
                            label: function(context) {
                                return `> System.eval(): ${context.raw} / 100`;
                            }
                        }
                    }
                }
            }
        };

        // 初始化图表
        new Chart(ctx, config);
    }

    // --- 11. HACKER VISITOR COUNTER (黑客风格计数器) ---
    const counterDisplay = document.getElementById('cyber-counter');
    const busuanziSource = document.getElementById('busuanzi_value_site_pv');

    if (counterDisplay && busuanziSource) {
        // 观察不蒜子元素的变化 (因为它也是异步加载的)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && busuanziSource.innerText) {
                    // 1. 获取真实数据
                    const rawVal = busuanziSource.innerText.trim();
                    // 2. 格式化 (补零到6位，如 001,234)
                    const finalVal = rawVal.padStart(6, '0').replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                    // 3. 启动解密动画
                    animateDecryption(counterDisplay, finalVal);

                    observer.disconnect(); // 动画只播一次
                }
            });
        });

        observer.observe(busuanziSource, { childList: true, subtree: true });

        // 如果不蒜子加载慢，先显示假动画占位
        let loadingInterval = setInterval(() => {
            if(!busuanziSource.innerText) {
                counterDisplay.innerText = Math.floor(Math.random()*999999).toString().padStart(6,'0');
            } else {
                clearInterval(loadingInterval);
            }
        }, 100);
    }

    // 解密动画函数
    function animateDecryption(element, targetText) {
        const chars = "0123456789";
        let iterations = 0;

        const interval = setInterval(() => {
            element.innerText = targetText
                .split("")
                .map((char, index) => {
                    if (char === ',' || char === '.') return char; // 标点符号不跳动
                    if (index < iterations) {
                        return targetText[index]; // 已经解密出的位
                    }
                    return chars[Math.floor(Math.random() * 10)]; // 还在跳动的乱码
                })
                .join("");

            if (iterations >= targetText.length) {
                clearInterval(interval);
                element.innerText = targetText; // 确保最终结果正确
                // 成功后的绿色闪烁反馈
                element.style.color = "#50fa7b";
                element.style.textShadow = "0 0 15px #50fa7b";
                setTimeout(() => {
                    element.style.color = ""; // 恢复原色
                    element.style.textShadow = "";
                }, 500);
            }

            iterations += 1/3; // 控制解密速度
        }, 30);
    }

    // --- 12. ID CARD GENERATOR (REFINED) ---
    let generatedCanvas = null; // 用于存储生成的 Canvas 对象

    // 1. 打开弹窗并开始生成预览
    window.generateAndPreviewID = function() {
        const overlay = document.getElementById('id-card-overlay');
        const previewArea = document.getElementById('id-preview-area');
        const loadingText = document.getElementById('id-loading-text');

        // 显示弹窗
        overlay.classList.add('active');
        previewArea.innerHTML = ''; // 清空旧预览
        previewArea.appendChild(loadingText); // 显示加载文字
        loadingText.style.display = 'block';

        // 模拟一点“扫描”的延迟感，增加科技感
        setTimeout(() => {
            updateCardData(); // 更新卡片上的时间和访客数据
            renderCardToCanvas(previewArea, loadingText);
        }, 800);
    };

    // 2. 关闭弹窗
    window.closeIDModal = function() {
        document.getElementById('id-card-overlay').classList.remove('active');
    };

    // 3. 执行下载
    window.downloadIDCard = function() {
        if (!generatedCanvas) return;

        const link = document.createElement('a');
        link.download = `PHIL_ACCESS_PASS_${Date.now()}.png`;
        link.href = generatedCanvas.toDataURL('image/png');
        link.click();

        // 下载后自动关闭
        setTimeout(window.closeIDModal, 1000);
    };

    // [Helper] 更新隐藏卡片的数据
    function updateCardData() {
        const visitorCount = document.getElementById('cyber-counter').innerText;
        const now = new Date();
        const timeStr = now.getFullYear() + '.' +
            (now.getMonth()+1).toString().padStart(2,'0') + '.' +
            now.getDate().toString().padStart(2,'0') + ' ' +
            now.getHours().toString().padStart(2,'0') + ':' +
            now.getMinutes().toString().padStart(2,'0');

        document.getElementById('card-visitor-id').innerText =
            (visitorCount === "INIT..." || !visitorCount) ? "UNKNOWN" : ("#" + visitorCount);
        document.getElementById('card-timestamp').innerText = timeStr;
    }

    // [Helper] 渲染逻辑
    function renderCardToCanvas(container, loader) {
        const cardElement = document.querySelector('.cyber-id-card');

        html2canvas(cardElement, {
            backgroundColor: '#050508',
            scale: 2, // 高清
            useCORS: true,
            logging: false
        }).then(canvas => {
            generatedCanvas = canvas; // 存起来供下载使用

            // 将 Canvas 缩小一点放入预览区
            canvas.style.width = "100%";
            canvas.style.height = "auto";

            loader.style.display = 'none';
            container.appendChild(canvas);
        }).catch(err => {
            console.error(err);
            loader.innerText = "Error: Rendering Failed.";
            loader.style.color = "var(--danger-color)";
        });
    }

    // --- 13. LIVE CODE PRINTER (完美版代码打印机) ---
    const codeContainer = document.getElementById('code-container');

    if (codeContainer) {
        // 1. 定义硬核的 Java 业务代码 (带 HTML 颜色标签)
        // 这里的代码完全符合您 "Credit Risk" 和 "High Performance" 的人设
        const sourceLines = [
            "<span class='code-kw'>package</span> com.phil.risk_system.core;",
            "",
            "<span class='code-kw'>import</span> org.springframework.stereotype.Service;",
            "<span class='code-kw'>import</span> reactor.core.publisher.Mono;",
            "",
            "<span class='code-com'>/**</span>",
            "<span class='code-com'> * High-performance Credit Risk Calculation Engine</span>",
            "<span class='code-com'> * Handles real-time exposure analysis for OTC derivatives.</span>",
            "<span class='code-com'> */</span>",
            "<span class='code-anno'>@Service</span>",
            "<span class='code-kw'>public class</span> <span class='code-cls'>CreditRiskEngine</span> {",
            "    ",
            "    <span class='code-kw'>private static final double</span> <span class='code-var'>VAR_CONFIDENCE</span> = <span class='code-num'>0.99</span>;",
            "    <span class='code-kw'>private final</span> <span class='code-cls'>GridComputeCluster</span> <span class='code-var'>computeGrid</span>;",
            "    ",
            "    <span class='code-com'>// Injecting high-availability dependency</span>",
            "    <span class='code-kw'>public</span> <span class='code-fn'>CreditRiskEngine</span>(<span class='code-cls'>GridComputeCluster</span> <span class='code-var'>grid</span>) {",
            "        <span class='code-kw'>this</span>.<span class='code-var'>computeGrid</span> = <span class='code-var'>grid</span>;",
            "    }",
            "    ",
            "    <span class='code-anno'>@Trace(level = \"INFO\")</span>",
            "    <span class='code-kw'>public</span> <span class='code-cls'>Mono</span>&lt;<span class='code-cls'>RiskReport</span>&gt; <span class='code-fn'>analyzeExposure</span>(<span class='code-cls'>TradeContext</span> <span class='code-var'>ctx</span>) {",
            "        <span class='code-kw'>return</span> <span class='code-var'>computeGrid</span>.<span class='code-fn'>dispatch</span>(<span class='code-var'>ctx</span>)",
            "                          .<span class='code-fn'>map</span>(<span class='code-kw'>this</span>::<span class='code-fn'>calculatePFE</span>) <span class='code-com'>// Potential Future Exposure</span>",
            "                          .<span class='code-fn'>filter</span>(<span class='code-var'>report</span> -> <span class='code-var'>report</span>.<span class='code-fn'>isWithinLimit</span>())",
            "                          .<span class='code-fn'>doOnError</span>(<span class='code-cls'>AlertSystem</span>::<span class='code-fn'>triggerBreach</span>);",
            "    }",
            "    ",
            "    <span class='code-kw'>private</span> <span class='code-cls'>RiskReport</span> <span class='code-fn'>calculatePFE</span>(<span class='code-cls'>SimulationResult</span> <span class='code-var'>sim</span>) {",
            "        <span class='code-com'>// Monte Carlo Simulation: 50,000 paths</span>",
            "        <span class='code-kw'>double</span> <span class='code-var'>exposure</span> = <span class='code-var'>sim</span>.<span class='code-fn'>getTailDistribution</span>(<span class='code-var'>VAR_CONFIDENCE</span>);",
            "        <span class='code-kw'>if</span> (<span class='code-var'>exposure</span> > <span class='code-cls'>Config</span>.<span class='code-var'>MAX_THRESHOLD</span>) {",
            "            <span class='code-cls'>System</span>.<span class='code-var'>out</span>.<span class='code-fn'>println</span>(<span class='code-str'>\"[WARN] COUNTERPARTY LIMIT BREACHED\"</span>);",
            "        }",
            "        <span class='code-kw'>return new</span> <span class='code-cls'>RiskReport</span>(<span class='code-var'>exposure</span>);",
            "    }",
            "}"
        ];

        let lineIndex = 0;
        let charIndex = 0;
        let currentHTML = ""; // 累积的 HTML

        // 2. 智能打字函数
        function typeCode() {
            if (lineIndex >= sourceLines.length) {
                // 写完了，停顿一下重头开始 (无限循环)
                setTimeout(() => {
                    codeContainer.innerHTML = "";
                    lineIndex = 0;
                    charIndex = 0;
                    currentHTML = "";
                    typeCode();
                }, 5000);
                return;
            }

            const currentLine = sourceLines[lineIndex];

            // 每次只处理一行里的一个“逻辑字符”
            // 为了处理 HTML 标签，我们需要判断当前 charIndex 指向的是不是 '<'
            if (charIndex < currentLine.length) {

                // 检查是否遇到 HTML 标签的开始
                if (currentLine[charIndex] === '<') {
                    // 如果是标签，直接找到闭合的 '>'，把整个标签一次性加进去
                    // 这样不会打出 '< s p a n...' 这种中间状态
                    const closeIndex = currentLine.indexOf('>', charIndex);
                    if (closeIndex !== -1) {
                        const tag = currentLine.substring(charIndex, closeIndex + 1);
                        currentHTML += tag;
                        charIndex = closeIndex + 1;
                    }
                } else {
                    // 普通字符，逐个打出
                    // 如果是 &lt; 或 &gt; 这种实体字符，也要整体处理，否则会乱
                    if (currentLine.substr(charIndex, 4) === '&lt;') {
                        currentHTML += '&lt;';
                        charIndex += 4;
                    } else if (currentLine.substr(charIndex, 4) === '&gt;') {
                        currentHTML += '&gt;';
                        charIndex += 4;
                    } else {
                        currentHTML += currentLine[charIndex];
                        charIndex++;
                    }
                }

                // 更新 DOM，加上光标
                codeContainer.innerHTML = currentHTML + "<span class='code-cursor'></span>";

                // 随机打字速度 (30ms - 80ms)
                setTimeout(typeCode, Math.random() * 50 + 30);

            } else {
                // 这一行打完了，换行
                currentHTML += "\n";
                codeContainer.innerHTML = currentHTML + "<span class='code-cursor'></span>";
                lineIndex++;
                charIndex = 0;

                // 换行时稍微停顿一下
                setTimeout(typeCode, 200);

                // 自动滚动到底部
                const bg = document.getElementById('code-background');
                bg.scrollTop = bg.scrollHeight;
            }
        }

        // 3. 启动引擎 (延迟1秒，等页面加载完)
        setTimeout(typeCode, 1000);
    }

    // --- 14. 3D HOLOGRAPHIC EFFECT (全息悬浮卡片 - 完美版) ---
    const holoCards = document.querySelectorAll('.card, .avatar-box, .feature-card');

    if (holoCards.length > 0) {
        holoCards.forEach(card => {
            // 1. 动态注入光泽层 (如果还没有的话)
            if (!card.querySelector('.holo-glare')) {
                const glare = document.createElement('div');
                glare.classList.add('holo-glare');
                card.appendChild(glare);
            }

            const glare = card.querySelector('.holo-glare');

            // 2. 鼠标进入：移除过渡，准备实时跟踪
            card.addEventListener('mouseenter', () => {
                // 瞬间响应，去除 CSS 的 transition 延迟
                card.style.transition = 'none';
                glare.style.opacity = '1';
            });

            // 3. 鼠标移动：计算 3D 旋转和光泽位置
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();

                // 计算鼠标在卡片内的坐标
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // 计算中心点
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // 计算旋转角度 (限制幅度在 ±8度，太夸张会晕)
                // 鼠标在左，卡片向左倾斜 (RotateY 负值)
                // 鼠标在上，卡片向上倾斜 (RotateX 正值)
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;

                // 应用 3D 变换
                // perspective(1000px): 透视深度
                // scale3d: 悬浮时稍微放大，增强层次感
                // translateY: 稍微上浮
                card.style.transform = `
                    perspective(1000px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    scale3d(1.02, 1.02, 1.02)
                    translateY(-5px)
                `;

                // 计算光泽位置 (跟随鼠标反向移动，模拟真实光源反射)
                // 当鼠标在右下角，反光应该出现在左上角
                const glareX = 100 - (x / rect.width * 100);
                const glareY = 100 - (y / rect.height * 100);

                glare.style.background = `radial-gradient(
                    circle at ${glareX}% ${glareY}%, 
                    rgba(255, 255, 255, 0.3) 0%, 
                    rgba(255, 255, 255, 0) 80%
                )`;
            });

            // 4. 鼠标离开：平滑复位
            card.addEventListener('mouseleave', () => {
                // 加回过渡，让卡片缓慢回正，而不是瞬间跳回
                card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';

                // 重置所有变换
                card.style.transform = `
                    perspective(1000px)
                    rotateX(0)
                    rotateY(0)
                    scale3d(1, 1, 1)
                    translateY(0)
                `;

                // 隐藏光泽
                glare.style.opacity = '0';
            });
        });
    }

    // --- 15. LAZY LOAD STATISTICS (隐形加载统计脚本) ---
    // 只有当页面完全就绪 3 秒后，才去请求不蒜子服务器
    // 这样绝对不会卡住首屏加载和 Preloader
    setTimeout(() => {
        console.log(">> SYSTEM_INFO: Initializing background telemetry...");
        const script = document.createElement('script');
        script.src = "//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
        script.async = true;
        // 遇到错误也不要报错，静默失败
        script.onerror = () => {
            console.warn(">> SYSTEM_WARN: Telemetry link severed (Busuanzi timeout).");
            // 你甚至可以在这里回退到一个假的基数，让它停止跳动
            // const fakeCount = "012345";
            // animateDecryption(document.getElementById('cyber-counter'), fakeCount);
        };
        document.body.appendChild(script);
    }, 3000);
});