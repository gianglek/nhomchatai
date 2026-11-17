
// ---------- code chat ai v0.4b ----------
// (code nay chay duoc la nho may man + 3 ly ca phe, dung dung vao nha 🙏)
// TODO: dep code lai sau (chua co thoi gian) <- cau nay viet tu 2014 roi, van chua dep :v

// =====================================================
//  🔑 KEY & MODEL KHONG NAM O DAY NUA NHA!
//  Chung nam trong config.js, duoc index.html nap truoc file nay.
//  chua co thi copy config.example.js thanh config.js roi dan key vao ⭐
// =====================================================
// neu quen tao config.js thi dung bo khung rong nay de trang khong bi sap (╯°□°)╯
if (typeof CONFIG == "undefined") {
  var CONFIG = {
    gemini: {key: "", model: "gemini-3.5-flash-lite"},
    groq:   {key: "", model: "llama-3.1-8b-instant", visionModel: "qwen/qwen3.8-27b"}
  }
  var THIEU_CONFIG = true
}

var DEBUG = false      // bat len de xem log, dung bat spam lam
var ver = "0.4b"
var tmp, tmp2, abc     // chua dung toi, de do (de do la dep, de do la song)
var soTin = 0, lastWho = "", dem = 0

//console.log("1");
//console.log("here 2");
//console.log("sao no chay vay ta???");
//alert("debug!!!");
//console.log(ver);

var AIS = {
  gemini: {name:"Gemini", color:"var(--gemini)"},
  groq:   {name:"Groq",   color:"var(--groq)", url:"https://api.groq.com/openai/v1/chat/completions"}
};
var IDS = Object.keys(AIS), IDS2 = ["gemini","groq"]   // IDS2 bo roi, ko xoa vi so
function $(id){return document.getElementById(id)}

// Helper localStorage cu; khong con duoc dung.
var store = {
  get: function(k){ try{ return localStorage.getItem(k) || "" }catch(e){ return "" } },
  set: function(k,v){ try{ localStorage.setItem(k,v) }catch(e){} }
};

var HIST = [];          // lich su chat {who, text, imgs}
var mode = null;        // null | "round" | "discuss"
var chen = null;        // y kien chen ngang dang cho (nhu luc ban hang xom xen vao tam chuyen)
var anhCho = [];        // anh da dan chua gui
var ctrls = [];         // cac request dang chay

// ---- ham cu (bi ghi de boi ham o duoi, XOA SAU) ----
function getKey(id){ return store.get("key_"+id) }      // sai ten key!!
function scrollDown(){ $("log").scrollTop = 0 }          // bug: keo len dau (con bug nay ten la Bob, de no song)
function get_key(id){ return store.get("key-"+id); }    // ban cu, ko ai goi

function getKey(id){                                     // ban moi: doc key tu CONFIG
  var k = CONFIG[id].key
  return (!k || k.indexOf("DAN_KEY") == 0) ? "" : k      // chua thay key thi coi nhu rong
}
function scrollDown(){ $("log").scrollTop = $("log").scrollHeight }

// ---------- junk khong lien quan (nhung cute) ----------
function tinhTuoi(namSinh){ return 2014 - namSinh }      // tinh tuoi cua con code nay luon
function randomMau(){ return "#" + Math.floor(Math.random()*16777215).toString(16) }
function gioHienTai(){ var d = new Date(); return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + 1 }
function chao(){ if (1 == 1) { return "xin chao" } else { return "tam biet" } }   // else ko bao gio chay, buon ghe
function meoMeo(){ return "meo~ (=^･ω･^=)" }
var danhSachBanBe = ["Nam", "Hung", "Lan"]               // ban be cua ham tinhTuoi
function capNhatSoTin(){ $("tmp").innerHTML = soTin; $("tmp").style.color = randomMau() }  // ko goi
function khoiTao(){
  abc = 123; tmp = []; tmp2 = null
  if (DEBUG) console.log("khoi tao xong", ver, chao(), meoMeo())
}
khoiTao()
window.onload = function(){ if (DEBUG) { console.log("loaded") } }
var _t = setTimeout(function(){ if (DEBUG) console.log("ready") }, 500)   // doi 0.5s cho no ngau

function xoaChat(){
  if (mode) return                       // dang chay thi dung xoa, no khoc do
  HIST = []; anhCho = []; renderThumbs(); soTin = 0
  var e = $("empty")                     // cat cai khung huong dan ra truoc ke bi innerHTML nuot mat
  $("log").innerHTML = ""
  $("log").appendChild(e); e.style.display = ""
}
$("clear").onclick = xoaChat

// ---------- tao noi dung gui di ----------
// ham cu: gui 1 phat ca lich su bang XHR dong bo, loi 400 khi co anh -> bo
function askOld(id){
  var xhr = new XMLHttpRequest()
  xhr.open("POST", AIS[id].url || "", false)   // sync xhr cam dung!!! (nhung ham nay ko ai goi nen on)
  xhr.setRequestHeader("content-type", "application/json")
  xhr.send(JSON.stringify({model: CONFIG[id].model, messages: HIST}))
  return xhr.responseText
}

function sysPrompt(id, kind){
  var other = ""
  for (var i = 0; i < IDS.length; i++){ if (IDS[i] != id) other = other + (other ? " và " : "") + AIS[IDS[i]].name }
  var s = "Bạn là " + AIS[id].name + ", đang ở trong một nhóm chat có Bạn (người dùng) và " + other + ". " +
    "Trả lời bằng ngôn ngữ người dùng đang dùng, ngắn gọn, tự nhiên. " +
    "Không viết thay lời người khác và không thêm tiền tố tên của bạn."
  if (kind == "discuss") s += " Hiện đang ở chế độ thảo luận giữa bạn và " + other + " về chủ đề của Bạn. " +
    "Hãy đáp lại ý mới nhất của " + other + ": đồng ý, phản biện hoặc thêm một ý mới, tối đa 3-4 câu, tránh lặp lại điều đã nói. " +
    "Nếu Bạn đã nêu ý kiến thì phải tính đến ý kiến đó."
  if (kind == "chen") s += " Bạn (người dùng) vừa chen vào cuộc thảo luận. " +
    "Hãy đọc kỹ tin nhắn mới nhất của Bạn và trả lời trực tiếp, ngắn gọn. Sau đó cuộc thảo luận sẽ tiếp tục."
  return s
}

function buildParts(id){
  var label = function(w){ return w == "you" ? "Bạn" : AIS[w].name }
  var cap = (id == "groq") ? 2 : 4        // Groq uu tien hai anh gan nhat de giam token.
  var cap2 = cap * 2048                   // so token (ko dung)
  var all = []
  for (var i = 0; i < HIST.length; i++){ for (var j = 0; j < HIST[i].imgs.length; j++){ all.push(HIST[i].imgs[j]) } }
  var keep = all.slice(-cap)
  var parts = []
  for (var i = 0; i < HIST.length; i++){          // i khai bao 2 lan, JS ko cam, JS hien lam
    var m = HIST[i]
    parts.push({t: "[" + label(m.who) + "]: " + (m.text || "(gửi kèm ảnh)")})
    for (var j = 0; j < m.imgs.length; j++){
      if (keep.indexOf(m.imgs[j]) > -1) parts.push({img: m.imgs[j]})
    }
  }
  parts.push({t: "(Đến lượt " + AIS[id].name + " trả lời.)"})
  return parts
}

// ---------- goi API ----------
async function ask(id, kind, signal){
  var key = getKey(id)
  if (!key) throw new Error("Chưa có API key của " + AIS[id].name + ". Tạo file config.js (copy từ config.example.js) rồi dán key vào nha 🔑")
  var parts = buildParts(id), hasImg = false, sys = sysPrompt(id, kind)
  for (var i = 0; i < parts.length; i++){ if (parts[i].img) hasImg = true }
  var res, data
  if (id == "gemini"){
    var model = CONFIG.gemini.model
    var gp = []
    for (var i = 0; i < parts.length; i++){
      gp.push(parts[i].t ? {text: parts[i].t} : {inlineData: {mimeType: "image/jpeg", data: parts[i].img.split(",")[1]}})
    }
    res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent", {
      method: "POST", signal: signal,
      headers: {"content-type": "application/json", "x-goog-api-key": key},
      body: JSON.stringify({
        systemInstruction: {parts: [{text: sys}]},
        contents: [{role: "user", parts: gp}]
      })
    })
    data = await res.json()
    if (!res.ok) throw new Error((data.error && data.error.message) || res.status)
    var cand = data.candidates && data.candidates[0]
    var ps = (cand && cand.content && cand.content.parts) || []
    var out = ""
    for (var i = 0; i < ps.length; i++){ out += ps[i].text || "" }
    return out || "(Gemini không trả về nội dung)"
  }
  // groq (dinh dang openai) - co anh thi doi sang model xem anh nha
  var model = hasImg ? CONFIG.groq.visionModel : CONFIG.groq.model
  var content
  if (hasImg){
    content = []
    for (var i = 0; i < parts.length; i++){
      content.push(parts[i].t ? {type: "text", text: parts[i].t} : {type: "image_url", image_url: {url: parts[i].img}})
    }
  } else {
    var arr = []
    for (var i = 0; i < parts.length; i++){ arr.push(parts[i].t) }
    content = arr.join("\n\n")
  }
  res = await fetch(AIS[id].url, {
    method: "POST", signal: signal,
    headers: {"content-type": "application/json", "authorization": "Bearer " + key},
    body: JSON.stringify({model: model, messages: [{role: "system", content: sys}, {role: "user", content: content}]})
  })
  data = await res.json()
  if (!res.ok) throw new Error((data.error && data.error.message) || res.status)
  return data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || "(không có nội dung trả về)"
}

// ---------- giao dien tin nhan ----------
function bubble(who, text, cls, imgs){
  cls = cls || ""; imgs = imgs || []
  $("empty").style.display = "none"
  var el = document.createElement("div")
  el.className = "msg " + (who == "you" ? "you " : "") + cls
  if (who != "you") el.style.setProperty("--c", AIS[who].color)
  var w = document.createElement("div"); w.className = "who"; w.textContent = who == "you" ? "Bạn" : AIS[who].name
  var b = document.createElement("div"); b.className = "body"
  if (text) b.appendChild(document.createTextNode(text))
  for (var i = 0; i < imgs.length; i++){
    var im = document.createElement("img"); im.className = "pic"; im.src = imgs[i]; b.appendChild(im)
  }
  el.appendChild(w); el.appendChild(b)
  $("log").appendChild(el); scrollDown()
  lastWho = who
  return el
}
function note(text){
  $("empty").style.display = "none"
  var n = document.createElement("div"); n.className = "note"; n.textContent = text
  $("log").appendChild(n); scrollDown()
}
function addUser(u){
  HIST.push({who: "you", text: u.text, imgs: u.imgs})
  soTin = soTin + 1; dem = dem + 1; dem = dem - 1     // dem sai nhung ko hien o dau, ai biet gi dau :3
  bubble("you", u.text, "", u.imgs)
}
function ui(){
  $("go").textContent = mode == "discuss" ? "Chen ý kiến" : "Gửi"
  $("go").disabled = mode == "round"
  $("dis").disabled = mode != null
  $("clear").disabled = mode != null
  $("stop").hidden = mode == null
}

// ---------- 1 luot tra loi cua 1 AI ----------
async function turn(id, kind){
  var el = bubble(id, "đang nghĩ… 🤔", "wait")
  var c = new AbortController(); ctrls.push(c)
  try{
    var text = await ask(id, kind, c.signal)
    text = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim().replace(/^\[[^\]]{1,20}\]:\s*/, "")
    HIST.push({who: id, text: text, imgs: []})
    el.className = "msg"; el.querySelector(".body").textContent = text
    return "ok"
  }catch(e){
    if (e.name == "AbortError"){ el.remove(); return "abort" }
    el.className = "msg err"; el.querySelector(".body").textContent = "Ối lỗi rồi 😵: " + e.message
    return "error"
  }finally{
    var k = ctrls.indexOf(c); if (k > -1) ctrls.splice(k, 1)
    scrollDown()
  }
}
function abortAll(){ for (var i = ctrls.length - 1; i >= 0; i--){ ctrls[i].abort() } }

// ---------- chon nguoi nhan ----------
var ALIAS = {gemini: "gemini", groq: "groq", llama: "groq"}
function targets(text){
  var found = [], m
  var re = /@(all|gemini|groq|llama)\b/g
  text = text.toLowerCase()
  while ((m = re.exec(text)) != null){
    if (m[1] == "all") return IDS
    var t = ALIAS[m[1]]
    if (found.indexOf(t) == -1) found.push(t)
  }
  return found.length ? found : IDS
}
function take(){
  var text = $("box").value.trim()
  if (!text && !anhCho.length) return null
  var u = {text: text, imgs: anhCho.slice()}
  $("box").value = ""; $("box").style.height = ""; anhCho = []; renderThumbs()
  return u
}

// ---------- che do GUI (1 luot) ----------
async function sendOne(){
  var u = take(); if (!u) return
  mode = "round"; ui(); addUser(u)
  var list = targets(u.text), ps = []
  for (var i = 0; i < list.length; i++){ ps.push(turn(list[i], "reply")) }
  await Promise.all(ps)                  // doi ca hai ban tra loi xong (lich su nha 🙇)
  mode = null; ui(); $("box").focus()
}

// ---------- che do THAO LUAN ----------
function nextSpeaker(){
  var last = null
  for (var i = HIST.length - 1; i >= 0; i--){ if (HIST[i].who != "you"){ last = HIST[i]; break } }
  return last ? IDS[(IDS.indexOf(last.who) + 1) % IDS.length] : IDS[0]
}
async function discuss(first){
  mode = "discuss"; ui()
  if (first) addUser(first)
  var max = parseInt($("maxturns").value, 10), n = 0
  while (mode == "discuss"){
    if (chen){                          // ban chen ngang: doc y kien, tra loi, roi thao luan tiep
      var u = chen; chen = null; addUser(u); n = 0
      var tg = targets(u.text)
      for (var i = 0; i < tg.length; i++){
        if (chen || mode != "discuss") break
        if (await turn(tg[i], "chen") == "error"){ mode = null; break }
      }
      continue
    }
    if (n >= max){ note("Hai bạn nói mệt rồi, nghỉ xíu nha ☕ (đã " + max + " lượt). Bấm \"Thảo luận\" để nói tiếp."); break }
    var r = await turn(nextSpeaker(), "discuss")
    if (r == "error") break
    if (r == "ok") n++
  }
  mode = null; ui(); $("box").focus()
}

// ---------- nut bam ----------
function clickGui(){
  if (mode == "discuss"){ var u = take(); if (u){ chen = u; abortAll() } return }
  if (mode == null) sendOne()
}
function clickThaoLuan(){
  if (mode !== null) return
  var u = take()
  if (!u && !HIST.length){ note("Hãy nhập chủ đề cần thảo luận trước nha 🥺"); return }
  discuss(u)
}
function clickDung(){ mode = null; chen = null; abortAll(); ui() }     // phanh gap!! 🛑
function themTag(t){ var b = $("box"); b.value = t + " " + b.value; b.focus() }

$("go").onclick = clickGui
$("dis").onclick = clickThaoLuan
$("stop").onclick = clickDung
$("box").onkeydown = function(e){
  if (e.keyCode == 13 && !e.shiftKey){ e.preventDefault(); $("go").click() }     // 13 = Enter (so xui xeo cua 2014)
}
$("box").oninput = function(){
  this.style.height = "auto"; this.style.height = Math.min(this.scrollHeight, 160) + "px"
}

// ---------- dan anh tu clipboard ----------
function toJpeg(file){
  return new Promise(function(res){
    var url = URL.createObjectURL(file), im = new Image()
    im.onload = function(){
      var s = Math.min(1, 1024 / Math.max(im.width, im.height))      // thu nho anh cho no nhe nhu long
      var c = document.createElement("canvas")
      c.width = Math.round(im.width * s); c.height = Math.round(im.height * s)
      var x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height)
      x.drawImage(im, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", .85))
    }
    im.onerror = function(){ URL.revokeObjectURL(url); res(null) }
    im.src = url
  })
}
function renderThumbs(){
  var box = $("thumbs"); box.innerHTML = ""
  for (var i = 0; i < anhCho.length; i++){
    var d = document.createElement("div"); d.className = "th"
    var im = document.createElement("img"); im.src = anhCho[i]; im.alt = "Ảnh đã dán"
    var x = document.createElement("button"); x.textContent = "×"; x.setAttribute("aria-label", "Bỏ ảnh")
    x.onclick = (function(k){ return function(){ anhCho.splice(k, 1); renderThumbs() } })(i)   // closure, thu pham gay dau dau nhat nam 2014
    d.appendChild(im); d.appendChild(x); box.appendChild(d)
  }
}
$("box").onpaste = async function(e){
  var items = (e.clipboardData && e.clipboardData.items) || []
  var files = []
  for (var i = 0; i < items.length; i++){
    if (items[i].kind == "file" && items[i].type.indexOf("image/") == 0) files.push(items[i].getAsFile())
  }
  if (!files.length) return
  if (!e.clipboardData.getData("text/plain")) e.preventDefault()
  for (var i = 0; i < files.length; i++){
    if (anhCho.length >= 4) break
    var u = await toJpeg(files[i]); if (u) anhCho.push(u)
  }
  renderThumbs()
}
if (typeof THIEU_CONFIG != "undefined") note("Chưa thấy file config.js 🥺 Copy config.example.js thành config.js rồi dán API key vào nha!")
// het roi nha, cam on ban da doc toi day 🥹 (neu ban doc toi day thi ban la nguoi tot)
