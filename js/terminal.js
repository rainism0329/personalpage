document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('terminal-overlay');
    const input = document.getElementById('cli-input');
    const content = document.getElementById('terminal-content');

    let isVisible = false;

    // 1. 切换终端显示/隐藏
    function toggleTerminal() {
        isVisible = !isVisible;
        if (isVisible) {
            overlay.classList.add('active');
            input.value = '';
            setTimeout(() => input.focus(), 100); // 延时聚焦
        } else {
            overlay.classList.remove('active');
            input.blur();
        }
    }

    // 2. 监听按键 (~ 键 和 ESC 键)
    document.addEventListener('keydown', (e) => {
        // 监听 ` 或 ~ 键 (Key code 通常是 Backquote)
        if (e.key === '`' || e.key === '~') {
            e.preventDefault(); // 防止输入字符
            toggleTerminal();
        }
        if (e.key === 'Escape' && isVisible) {
            toggleTerminal();
        }
    });

    // 3. 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) toggleTerminal();
    });

    // 4. 处理命令输入
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim();
            if (cmd) {
                processCommand(cmd);
            }
            input.value = '';
            // 保持滚动条在最下方
            setTimeout(() => {
                content.scrollTop = content.scrollHeight;
            }, 10);
        }
    });

    // 5. 命令处理逻辑
    function print(text, type = '') {
        const div = document.createElement('div');
        div.className = `output-line ${type}`;
        div.innerHTML = text; // 允许 HTML 标签
        content.appendChild(div);
    }

    function processCommand(rawCmd) {
        // 打印用户输入的历史
        print(`<span style="color:#50fa7b">root@phil:~$</span> ${rawCmd}`);

        const cmd = rawCmd.toLowerCase();

        switch (cmd) {
            case 'help':
                print("Available commands:");
                print("&nbsp; - <span class='cmd-highlight'>whoami</span>   : View user profile");
                print("&nbsp; - <span class='cmd-highlight'>projects</span> : List deployed builds");
                print("&nbsp; - <span class='cmd-highlight'>contact</span>  : Get communication channels");
                print("&nbsp; - <span class='cmd-highlight'>clear</span>    : Clear terminal history");
                print("&nbsp; - <span class='cmd-highlight'>sudo</span>     : ??? (Admin access)");
                print("&nbsp; - <span class='cmd-highlight'>exit</span>     : Close terminal");
                break;

            case 'whoami':
                print("Name: Mingzhe (Phil) Zhang", "res-info");
                print("Role: Senior Software Engineer / Backend Arch", "res-info");
                print("Loc : Singapore (Current)", "res-info");
                print("Tag : Java Expert, Cloud Native, IntelliJ Plugin Dev", "res-info");
                break;

            case 'projects':
                print("Loading project database...", "res-warn");
                setTimeout(() => {
                    print("1. Enterprise Monitor [Java/Spring]", "res-info");
                    print("2. Unified Data Platform [Guice/Groovy]", "res-info");
                    print("3. RestPilot (IntelliJ Plugin) [Kotlin/Swing]", "res-info");
                    print("4. Parquet Viewer (IntelliJ Plugin)", "res-info");
                }, 400);
                break;

            case 'contact':
                print("Email : mzhe0329@hotmail.com");
                print("GitHub: <a href='https://github.com/rainism0329' target='_blank' style='color:#00fff2; text-decoration:underline'>github.com/rainism0329</a>");
                break;

            case 'clear':
                content.innerHTML = '';
                print("Terminal cleared.");
                break;

            case 'exit':
                toggleTerminal();
                break;

            case 'sudo':
                print("Permission denied: You are not Phil.", "res-error");
                print("Nice try though.", "res-warn");
                break;

            case 'rm -rf /':
                print("System protected. Do not attempt this again.", "res-error");
                break;

            default:
                print(`Command not found: ${cmd}. Type 'help' for list.`, "res-error");
        }
    }
});