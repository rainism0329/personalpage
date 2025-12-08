/**
 * Terminal Logic v2.0
 * Features: I18n, Game Cheats, Typing SFX, Updated Profile
 */

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('terminal-overlay');
    const input = document.getElementById('cli-input');
    const content = document.getElementById('terminal-content');

    if (!overlay || !input || !content) return;

    let isVisible = false;

    // --- 1. 多语言语料库 ---
    const termData = {
        en: {
            welcome: "Welcome to Phil's Terminal v2.0 (kernel 5.15)",
            help_desc: "Type <span class='cmd-highlight'>'help'</span> to see available commands.",
            help_list: "Available commands:",
            cmd_whoami: "View user profile",
            cmd_projects: "List system architectures",
            cmd_contact: "Get encrypted channels",
            cmd_hack: "Inject cheats into Game Module",
            cmd_clear: "Clear terminal history",
            cmd_exit: "Close session",
            info_name: "Name: Mingzhe (Phil) Zhang",
            info_role: "Role: Lead Software Engineer", // English keeps Lead
            hack_success: ">> INJECTION SUCCESSFUL. GOD MODE ENABLED.",
            hack_fail: ">> ERROR: Game module not running.",
            err_cmd: "Command not found:"
        },
        zh: {
            welcome: "欢迎访问 Phil 的终端 v2.0 (内核 5.15)",
            help_desc: "输入 <span class='cmd-highlight'>'help'</span> 查看可用命令。",
            help_list: "可用命令列表:",
            cmd_whoami: "查看用户档案",
            cmd_projects: "列出系统架构",
            cmd_contact: "获取加密联系方式",
            cmd_hack: "向游戏模块注入作弊码",
            cmd_clear: "清除屏幕",
            cmd_exit: "关闭会话",
            info_name: "姓名: 张明哲 (Phil)",
            // [修改点] 中文改为资深
            info_role: "职位: 资深软件工程师 (Lead)",
            hack_success: ">> 注入成功。无敌模式已开启 (God Mode)。",
            hack_fail: ">> 错误: 游戏模块未运行。",
            err_cmd: "未找到命令:"
        }
    };

    function getLang() { return localStorage.getItem('site_lang') || 'en'; }

    // --- 2. 核心控制 ---
    function toggleTerminal() {
        isVisible = !isVisible;
        if (isVisible) {
            overlay.classList.remove('hidden');
            void overlay.offsetWidth;
            overlay.classList.add('active');
            input.value = '';
            setTimeout(() => input.focus(), 100);

            const t = termData[getLang()];
            print(t.welcome, "res-info");
            print(t.help_desc);
        } else {
            overlay.classList.remove('active');
            setTimeout(() => { if(!isVisible) overlay.classList.add('hidden'); }, 300);
            input.blur();
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === '`' || e.key === '~') { e.preventDefault(); toggleTerminal(); }
        if (e.key === 'Escape' && isVisible) toggleTerminal();
    });

    overlay.addEventListener('click', (e) => { if (e.target === overlay) toggleTerminal(); });

    // --- 3. 命令处理 ---
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim();
            if (cmd) processCommand(cmd);
            input.value = '';
            setTimeout(() => content.scrollTop = content.scrollHeight, 10);
            playTypingSound();
        }
    });

    function print(text, type = '') {
        const div = document.createElement('div');
        div.className = `output-line ${type}`;
        div.innerHTML = text;
        content.appendChild(div);
    }

    function processCommand(rawCmd) {
        print(`<span style="color:#50fa7b">root@phil:~$</span> ${rawCmd}`);
        const cmd = rawCmd.toLowerCase();
        const t = termData[getLang()];

        playTypingSound();

        if (cmd === 'help') {
            print(t.help_list);
            print(`&nbsp; - <span class='cmd-highlight'>whoami</span>   : ${t.cmd_whoami}`);
            print(`&nbsp; - <span class='cmd-highlight'>projects</span> : ${t.cmd_projects}`);
            print(`&nbsp; - <span class='cmd-highlight'>contact</span>  : ${t.cmd_contact}`);
            print(`&nbsp; - <span class='cmd-highlight'>hack game</span>: ${t.cmd_hack}`);
            print(`&nbsp; - <span class='cmd-highlight'>clear</span>    : ${t.cmd_clear}`);
            print(`&nbsp; - <span class='cmd-highlight'>exit</span>     : ${t.cmd_exit}`);
            return;
        }

        if (cmd === 'whoami') {
            print(t.info_name, "res-info");
            print(`${t.info_role} <span style='color:var(--gold)'>[Top-Tier IB]</span>`, "res-info");
            return;
        }

        if (cmd === 'projects') {
            // [修改点] 项目列表更新
            print("1. Credit Risk Management System [Lead Arch]", "res-info");
            print("&nbsp;&nbsp; -> Real-time counterparty exposure & stress testing.", "res-info");
            print("2. AutoWatch Plus (Citi) [Java/Spring]", "res-info");
            print("3. Unified Data Platform [Guice/Groovy]", "res-info");
            return;
        }

        if (cmd === 'contact') {
            print("Email : <a href='mailto:bigphil.zhang@qq.com' style='color:var(--primary-color)'>bigphil.zhang@qq.com</a>");
            return;
        }

        if (cmd === 'clear') { content.innerHTML = ''; return; }
        if (cmd === 'exit') { toggleTerminal(); return; }

        if (cmd === 'reboot' || cmd === 'sudo reboot') {
            print("SYSTEM REBOOT INITIATED...", "res-warn");
            document.body.style.transition = "opacity 1s";
            document.body.style.opacity = "0";
            setTimeout(() => location.reload(), 1500);
            return;
        }

        if (cmd.includes('hack game')) {
            if (cmd.includes('--god')) {
                if (window.gameInstance) {
                    window.gameInstance.enableGodMode();
                    print(t.hack_success, "res-warn");
                } else {
                    print(t.hack_fail, "res-error");
                }
            }
            else if (cmd.includes('--off') || cmd.includes('--clear')) {
                if (window.gameInstance) {
                    window.gameInstance.disableGodMode();
                    const msg = getLang() === 'zh' ? ">> 作弊码已清除。系统恢复正常。" : ">> HACK DISABLED. SYSTEM NORMAL.";
                    print(msg, "res-info");
                } else {
                    print(t.hack_fail, "res-error");
                }
            }
            else {
                print("Usage: hack game [--god | --off]", "res-info");
            }
            return;
        }

        if (cmd.includes('sudo')) {
            print("root: Permission denied. You are not the Admin.", "res-error");
            return;
        }

        print(`${t.err_cmd} ${cmd}`, "res-error");
    }

    function playTypingSound() {
        const sfx = document.getElementById('sfx-hover');
        if (sfx) {
            sfx.currentTime = 0;
            sfx.volume = 0.2;
            sfx.playbackRate = 1.5 + Math.random() * 0.5;
            sfx.play().catch(()=>{});
        }
    }
});