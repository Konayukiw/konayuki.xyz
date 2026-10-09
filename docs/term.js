(function () {
  const term = document.querySelector(".term");
  const body = term && term.querySelector(".body");
  const form = document.getElementById("prompt");
  const input = document.getElementById("cmd");
  const closeBtn = document.getElementById("close");
  const fileBtn = document.getElementById("readme-file");
  if (!body || !form || !input) return;

  const HOME = "C:\\Users\\Konayuki";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scrollBehavior = () => (reduced.matches ? "auto" : "smooth");

  const templates = {};
  ["sec-readme", "sec-apps", "sec-web", "sec-contact"].forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    const copy = node.cloneNode(true);
    copy.removeAttribute("id");
    templates[id] = copy;
  });
  const linksTemplate = (function () {
    const node = document.querySelector(".kv .links");
    return node ? node.cloneNode(true) : null;
  })();

  const transcript = Array.from(body.children).filter(
    (child) => child !== form && !child.classList.contains("foot")
  );
  const added = [];
  const entered = [];
  let histIndex = 0;
  let draft = "";

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function line(className, children) {
    const node = el("div", className);
    for (const child of children) {
      node.append(typeof child === "string" ? document.createTextNode(child) : child);
    }
    form.before(node);
    added.push(node);
    return node;
  }

  function prompt(text) {
    return line(null, [el("span", "prompt", "PS " + HOME + ": "), el("span", "cmd", text)]);
  }

  function out(...children) {
    return line("out", children);
  }

  function fails(text) {
    return line("out", [el("div", "err", text)]);
  }

  function template(id) {
    return templates[id] ? templates[id].cloneNode(true) : null;
  }

  function helpList() {
    const wrap = el("div", "cmdlist");
    for (const cmd of COMMANDS) {
      wrap.append(el("span", "k", cmd.usage));
      const desc = el("span", "d", cmd.desc);
      if (cmd.alias) {
        desc.append(" ", el("span", "a", "[" + cmd.alias + "]"));
      }
      wrap.append(desc);
    }
    return wrap;
  }

  const FILES = { "readme.md": "sec-readme", "contact.txt": "sec-contact" };
  const DIRS = { apps: "sec-apps", web: "sec-web" };

  function resolvePath(arg) {
    return String(arg || "")
      .replace(/^[A-Za-z]:\\Users\\Konayuki\\/i, "")
      .replace(/^\.?[\\/]/, "")
      .replace(/[\\/]+$/, "")
      .toLowerCase();
  }

  function getContent(args) {
    const target = resolvePath(args[0]);
    if (!target) return fails("Get-Content : パラメーター 'Path' の引数を指定してください。");
    const tpl = FILES[target] && template(FILES[target]);
    if (!tpl) return fails("Get-Content : パス '" + HOME + "\\" + target + "' が存在しないため検索できません。");
    return line(null, [tpl]);
  }

  function dirList() {
    const wrap = el("div", "dirmap");
    wrap.append(el("span", "h", "Mode"), el("span", "h", "Name"));
    wrap.append(el("span", "m", "----"), el("span", "m", "----"));
    const rows = [
      ["d----", "apps", "dir"],
      ["d----", "web", "dir"],
      ["-a---", "README.md", ""],
      ["-a---", "contact.txt", ""]
    ];
    for (const row of rows) {
      wrap.append(el("span", "m", row[0]), el("span", row[2], row[1]));
    }
    return wrap;
  }

  function getChildItem(args) {
    const target = resolvePath(args[0]);
    if (!target) return out(dirList());
    const tpl = DIRS[target] && template(DIRS[target]);
    if (!tpl) return fails("Get-ChildItem : パス '" + HOME + "\\" + target + "' が存在しないため検索できません。");
    return line(null, [tpl]);
  }

  function whoami() {
    return out("Desktop\\Konayuki");
  }

  function getDate() {
    const d = new Date();
    const two = (n) => String(n).padStart(2, "0");
    return out(
      d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日 " +
      two(d.getHours()) + ":" + two(d.getMinutes()) + ":" + two(d.getSeconds())
    );
  }

  function echo(args) {
    return out(args.join(" "));
  }

  function links() {
    if (!linksTemplate) return fails("links : リンクが見つかりません。");
    const row = el("div", "kv");
    row.append("links: ", linksTemplate.cloneNode(true));
    return out(row);
  }

  function history() {
    if (!entered.length) return out(el("span", "comment", "# まだ何も入力していません"));
    const wrap = el("div", "cmdlist");
    entered.forEach((cmd, index) => {
      wrap.append(el("span", "k", String(index + 1)), el("span", "d", cmd));
    });
    return out(wrap);
  }

  function clearScreen() {
    for (const node of transcript) node.remove();
    for (const node of added) node.remove();
    added.length = 0;
  }

  function snow(args) {
    const api = window.snowfall;
    if (!api) return fails("snow : 雪のエフェクトを操作できませんでした。");
    const arg = (args[0] || "").toLowerCase();
    if (arg && arg !== "on" && arg !== "off") {
      return fails("snow : パラメーター '" + args[0] + "' を認識できません。on または off を指定してください。");
    }
    if (arg) api.set(arg === "on");
    else api.toggle();
    return out(api.enabled ? "snow : on" : "snow : off");
  }

  function closeWindow() {
    document.body.classList.add("term-closed");
    if (fileBtn) fileBtn.focus({ preventScroll: true });
  }

  function restore() {
    for (const node of added) node.remove();
    added.length = 0;
    for (const node of transcript) {
      if (!node.isConnected) form.before(node);
    }
    entered.length = 0;
    histIndex = 0;
    draft = "";
    input.value = "";
  }

  const COMMANDS = [
    { names: ["help", "?", "get-help"], usage: "help, ?", desc: "ヘルプを表示", run: () => out(helpList()) },
    { names: ["get-content", "cat", "type"], usage: "Get-Content <File>", alias: "cat, type", desc: "ファイルの中身を表示", run: getContent },
    { names: ["get-childitem", "ls", "dir", "gci"], usage: "Get-ChildItem [Path]", alias: "ls, dir", desc: "ディレクトリ下のファイルを表示", run: getChildItem },
    { names: ["whoami"], usage: "whoami", desc: "ユーザー名を表示", run: whoami },
    { names: ["get-date", "date"], usage: "Get-Date", alias: "date", desc: "現在の日時を表示", run: getDate },
    { names: ["echo", "write-output"], usage: "echo <Text>", alias: "Write-Output", desc: "テキストを表示", run: echo },
    { names: ["links"], usage: "links", desc: "連絡先リンクを表示", run: links },
    { names: ["history", "get-history"], usage: "history", alias: "Get-History", desc: "入力したコマンドの履歴を表示", run: history },
    { names: ["cls", "clear", "clear-host"], usage: "cls", alias: "clear", desc: "画面を消去", run: clearScreen },
    { names: ["snow"], usage: "snow [On|Off]", desc: "雪のエフェクトを切り替える", run: snow },
    { names: ["exit", "close"], usage: "exit", alias: "close", desc: "ウィンドウを閉じる", run: closeWindow }
  ];

  function exec(text) {
    const parts = text.split(/\s+/);
    const head = parts[0].toLowerCase();
    const cmd = COMMANDS.find((item) => item.names.indexOf(head) !== -1);
    if (!cmd) {
      return fails(
        parts[0] + " : 用語 '" + parts[0] +
        "' は、コマンドレット、関数、スクリプト ファイル、または操作可能なプログラムの名前として認識されません。名前が正しく記述されていることを確認し、パスが含まれている場合はそのパスが正しいことを確認してから、再試行してください。"
      );
    }
    cmd.run(parts.slice(1));
  }

  function submit(raw) {
    const text = raw.trim();
    prompt(text);
    if (text) {
      entered.push(text);
      exec(text);
    }
    histIndex = entered.length;
    draft = "";
    input.value = "";
    form.scrollIntoView({ block: "nearest", behavior: scrollBehavior() });
  }

  function recall(step) {
    if (!entered.length) return;
    if (histIndex >= entered.length) draft = input.value;
    histIndex = Math.min(entered.length, Math.max(0, histIndex + step));
    input.value = histIndex >= entered.length ? draft : entered[histIndex];
    input.setSelectionRange(input.value.length, input.value.length);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    submit(input.value);
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      recall(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      recall(1);
    } else if (event.key.toLowerCase() === "l" && event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      submit("cls");
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeWindow);
  if (fileBtn) {
    fileBtn.addEventListener("click", function () {
      restore();
      document.body.classList.remove("term-closed");
      window.scrollTo(0, 0);
      input.focus({ preventScroll: true });
    });
  }

  body.addEventListener("click", function (event) {
    if (event.target.closest("a, button, input, form")) return;
    input.focus({ preventScroll: true });
  });
})();
