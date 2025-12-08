/**
 * Terminal Logic
 * 模拟黑客终端交互，同步了最新的个人信息和项目经历
 */

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('terminal-overlay');
    const input = document.getElementById('cli-input');
    const content = document.getElementById('terminal-content');

    // 防止重复初始化
    if (!overlay || !input || !content) return;

    let isVisible = false;

    // --- 1. 核心控制逻辑 ---

    function toggleTerminal() {
        isVisible = !isVisible;
        if (isVisible) {
            overlay.classList.remove('hidden'); // 移除 hidden 类
            // 强制重绘以触发 transition
            void overlay.offsetWidth;
            overlay.classList.add('active');
            input.value = '';
            setTimeout(() => input.focus(), 100);
        } else {
            overlay.classList.remove('active');
            setTimeout(() => {
                if(!isVisible) overlay.classList.add('hidden');
            }, 300); // 等待动画结束
            input.blur();
        }
    }

    // 监听全局按键 (呼出/隐藏)
    document.addEventListener('keydown', (e) => {
        // 监听 ` 或 ~ 键
        if (e.key === '`' || e.key === '~') {
            e.preventDefault();
            toggleTerminal();
        }
        // ESC 键关闭
        if (e.key === 'Escape' && isVisible) {
            toggleTerminal();
        }
    });

    // 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) toggleTerminal();
    });

    // --- 2. 命令处理系统 ---

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim();
            if (cmd) {
                processCommand(cmd);
            }
            input.value = '';
            // 自动滚动到底部
            setTimeout(() => {
                content.scrollTop = content.scrollHeight;
            }, 10);
        }
    });

    function print(text, type = '') {
        const div = document.createElement('div');
        div.className = `output-line ${type}`;
        div.innerHTML = text;
        content.appendChild(div);
    }

    function processCommand(rawCmd) {
        // 打印输入历史
        print(`<span style="color:#50fa7b">root@phil:~$</span> ${rawCmd}`);

        const cmd = rawCmd.toLowerCase();

        switch (cmd) {
            case 'help':
                print("Available commands:");
                print("&nbsp; - <span class='cmd-highlight'>whoami</span>   : View user profile");
                print("&nbsp; - <span class='cmd-highlight'>projects</span> : List system architectures");
                print("&nbsp; - <span class='cmd-highlight'>contact</span>  : Get encrypted channels");
                print("&nbsp; - <span class='cmd-highlight'>clear</span>    : Clear terminal history");
                print("&nbsp; - <span class='cmd-highlight'>exit</span>     : Close session");
                break;

            case 'whoami':
                // [UPDATE] 同步了最新的 Lead Title
                print("Name: Mingzhe (Phil) Zhang", "res-info");
                print("Role: <span style='color:var(--primary-color)'>Lead Software Engineer</span>", "res-info");
                print("Org : Top-Tier Investment Bank", "res-info");
                print("Loc : Singapore / Shanghai", "res-info");
                print("Tag : Java Expert, High-Frequency Trading, Cloud Native", "res-info");
                break;

            case 'projects':
                print("Fetching deployed modules...", "res-warn");
                setTimeout(() => {
                    // [UPDATE] 新增了 Nomura 相关的项目描述
                    print("1. Next-Gen Trading Platform [Lead Arch]", "res-info");
                    print("&nbsp;&nbsp; -> High-concurrency financial trading system.", "res-info");

                    print("2. Enterprise Monitor (AWP) [Java/Spring]", "res-info");
                    print("&nbsp;&nbsp; -> SLA-critical file monitoring for banking.", "res-info");

                    print("3. Unified Data Platform [Guice/Groovy]", "res-info");

                    print("4. Intelli-Plugins (RestPilot/Parquet) [Open Source]", "res-info");
                }, 400);
                break;

            case 'contact':
                // [UPDATE] 同步了新的 QQ 邮箱
                print("Email : <a href='mailto:bigphil.zhang@qq.com' style='color:var(--primary-color)'>bigphil.zhang@qq.com</a>");
                print("GitHub: <a href='https://github.com/rainism0329' target='_blank' style='color:var(--primary-color)'>rainism0329</a>");
                break;

            case 'clear':
                content.innerHTML = '';
                print("Terminal cleared.");
                break;

            case 'exit':
                toggleTerminal();
                break;

            // 彩蛋部分
            case 'sudo':
                print("root@phil: Permission denied.", "res-error");
                print("Nice try. But you are not the Architect.", "res-warn");
                break;

            case 'rm -rf /':
                print("⚠️ SYSTEM ALERT: Self-destruct sequence initiated...", "res-error");
                setTimeout(() => print("Just kidding. Don't do that.", "res-info"), 1000);
                break;

            case 'ls':
                print("access_logs.txt", "res-info");
                print("secret_keys.pem <span style='color:red'>(Encrypted)</span>", "res-info");
                print("todo_list.md", "res-info");
                break;

            case 'cat todo_list.md':
                print("- Refactor legacy code", "res-info");
                print("- Drink coffee", "res-info");
                print("- Deploy to production (Friday 5PM)", "res-info");
                break;

            default:
                print(`Command not found: ${cmd}. Type 'help' for list.`, "res-error");
        }
    }
});