/* =============================================================
   Ducada Daynta — app.js
   Vanilla JS PWA. No backend. Somali-first, Arabic + English.
   Journal entries are encrypted at rest with a key derived from
   the user's PIN (PBKDF2 -> AES-GCM). The PIN itself is never
   stored — only a canary blob used to verify it on unlock.
   ============================================================= */

(() => {
"use strict";

/* ---------------------------------------------------------------
   1. CONTENT: i18n strings + dua data
   --------------------------------------------------------------- */

const I18N = {
  title:            { so: "Ducada Daynta", ar: "دعاء الدين", en: "Debt Dua" },
  tagline:          { so: "Ku tawakal Allaha Rizqa Bixiya", ar: "توكل على الله الرزاق", en: "Trust in Allah, The Provider" },
  install:          { so: "Ku rakib", ar: "تثبيت", en: "Install" },
  tab_home:         { so: "Hoyga", ar: "الرئيسية", en: "Home" },
  tab_library:      { so: "Ducada", ar: "الأدعية", en: "Duas" },
  tab_journal:      { so: "Qorshaha", ar: "المفكرة", en: "Journal" },
  tab_settings:     { so: "Dejinta", ar: "الإعدادات", en: "Settings" },
  disclaimer:       { so: "Tarjumaadda macnaha kaliya. Ducadu ma dammaanad qaado natiijo maaliyadeed — waa tawakul, dadaal iyo sabar.", ar: "ترجمة المعنى فقط. الدعاء لا يضمن نتائج مالية — بل هو توكل، سعي وصبر.", en: "Translation of meaning only. Dua does not guarantee financial outcomes — it is trust, effort, and patience." },
  dua_of_day:       { so: "Ducada Maalinlaha", ar: "دعاء اليوم", en: "Dua of the Day" },
  all_duas:         { so: "Dhammaan Ducooyinka", ar: "كل الأدعية", en: "All Duas" },
  favorites:        { so: "La Doortay", ar: "المفضلة", en: "Favorites" },
  listen:           { so: "Dhagayso", ar: "استمع", en: "Listen" },
  stop:             { so: "Jooji", ar: "إيقاف", en: "Stop" },
  track:            { so: "Tirada", ar: "العدد", en: "Count" },
  meaning_label:    { so: "TARJUMAADDA MACNAHA", ar: "ترجمة المعنى", en: "TRANSLATION OF MEANING" },

  lock_title:       { so: "Qorshaha Waa Xiran Yahay", ar: "المفكرة مقفلة", en: "Journal Locked" },
  lock_sub:         { so: "Geli lambarkaaga sirta ah si aad u furto qorshahaaga gaarka ah.", ar: "أدخل رمزك السري لفتح مفكرتك الخاصة.", en: "Enter your PIN to open your private journal." },
  lock_setup_title: { so: "Deji Lambar Sir Ah", ar: "إعداد رمز سري", en: "Set a PIN" },
  lock_setup_sub:   { so: "Lambarkan ayaa lagu ilaalinayaa qorshahaaga. Ha ilaawin — lama soo celin karo.", ar: "سيُستخدم هذا الرمز لحماية مفكرتك. لا تنسه — لا يمكن استرجاعه.", en: "This PIN protects your journal. Don't forget it — it can't be recovered." },
  lock_confirm_sub: { so: "Ku celi lambarka si aad u xaqiijiso.", ar: "أعد إدخال الرمز للتأكيد.", en: "Enter it again to confirm." },
  lock_wrong:       { so: "Lambarku waa qalad. Isku day mar kale.", ar: "الرمز غير صحيح. حاول مرة أخرى.", en: "Wrong PIN. Try again." },
  lock_mismatch:    { so: "Lambarradu iskuma eka. Isku day mar kale.", ar: "الرمزان غير متطابقين. حاول مرة أخرى.", en: "PINs don't match. Try again." },

  journal_placeholder: { so: "Qor yoolalkaaga maaliyadeed ama fikradahaaga halkan...", ar: "اكتب أهدافك المالية أو أفكارك هنا...", en: "Write your financial goals or thoughts here..." },
  journal_empty:    { so: "Wax qoraal ah ma jiraan weli", ar: "لا توجد ملاحظات بعد", en: "No entries yet" },
  journal_personal: { so: "Shakhsi ah", ar: "شخصي", en: "Personal" },
  journal_save:     { so: "Kaydi", ar: "حفظ", en: "Save" },
  delete:           { so: "Tirtir", ar: "حذف", en: "Delete" },
  cancel:           { so: "Jooji", ar: "إلغاء", en: "Cancel" },
  delete_entry_title: { so: "Tirtir Qoraalka?", ar: "حذف الملاحظة؟", en: "Delete entry?" },
  delete_entry_body:  { so: "Tallaabadan lama soo celin karo.", ar: "لا يمكن التراجع عن هذا الإجراء.", en: "This action cannot be undone." },

  settings_language:     { so: "Luqadda", ar: "اللغة", en: "Language" },
  settings_journal_lock: { so: "Xir Qorshaha (PIN)", ar: "قفل المفكرة (رمز سري)", en: "Lock Journal (PIN)" },
  settings_journal_lock_desc: { so: "Ilaali qoraaladaada gaarka ah lambar sir ah.", ar: "احمِ ملاحظاتك الخاصة برمز سري.", en: "Protect your private entries with a PIN." },
  settings_reset_journal: { so: "Tirtir Qorshaha Oo Dhan", ar: "إعادة تعيين المفكرة بالكامل", en: "Reset Journal Completely" },
  settings_reset_journal_desc: { so: "Tirtirid dhammaan qoraalada iyo lambarka sirta ah.", ar: "يحذف كل الملاحظات والرمز السري.", en: "Erases all entries and the PIN." },
  reset_confirm_title: { so: "Tirtir Dhammaan Qorshaha?", ar: "حذف المفكرة بالكامل؟", en: "Reset journal?" },
  reset_confirm_body:  { so: "Dhammaan qoraaladaada iyo lambarka sirta ah waa la tirtirayaa. Lama soo celin karo.", ar: "سيتم حذف كل ملاحظاتك ورمزك السري نهائيًا. لا يمكن التراجع.", en: "All entries and your PIN will be permanently erased. This cannot be undone." },

  about_line1: { so: "Ducada Daynta — samaysan si loo taageero tawakul iyo dadaal.", ar: "دعاء الدين — صُمم لدعم التوكل والسعي.", en: "Debt Dua — built to support trust in Allah and honest effort." },
  about_line2: { so: "Xogtaadu gudahaa jirkaaga ayay ku hartaa. Wax internet lagama diro.", ar: "بياناتك تبقى على جهازك فقط. لا شيء يُرسل عبر الإنترنت.", en: "Your data stays on this device. Nothing is ever sent anywhere." },

  toast_saved:      { so: "Waa la kaydiyay", ar: "تم الحفظ", en: "Saved" },
  toast_deleted:    { so: "Waa la tirtiray", ar: "تم الحذف", en: "Deleted" },
  toast_fav_on:     { so: "Waxaa lagu daray la doortay", ar: "أُضيف إلى المفضلة", en: "Added to favorites" },
  toast_fav_off:    { so: "Waxaa laga saaray la doortay", ar: "أُزيل من المفضلة", en: "Removed from favorites" },
  toast_reset:      { so: "Qorshaha waa la tirtiray", ar: "تمت إعادة تعيين المفكرة", en: "Journal reset" },
  toast_pin_set:    { so: "Lambarka sirta ah waa la deji", ar: "تم إعداد الرمز السري", en: "PIN set" },
  toast_tts_error:  { so: "Codku diyaar ma aha jirkan. Isku day markale.", ar: "الصوت غير متاح على هذا الجهاز.", en: "Voice playback isn't available on this device." },
  toast_tts_no_voice: { so: "Qalabkan cod Carabi ah ma lahan — waxaad ku dari kartaa Dejinta Qalabka (Settings) > Luqadaha.", ar: "لا يوجد صوت عربي على هذا الجهاز — يمكنك إضافته من إعدادات اللغة في جهازك.", en: "This device has no Arabic voice installed — you can add one from your device's language settings." },
  toast_installed:  { so: "Ducada Daynta waa lagu rakibay!", ar: "تم تثبيت التطبيق!", en: "Ducada Daynta is installed!" },

  goal_label:       { so: "Yoolka Maalinlaha", ar: "الهدف اليومي", en: "Daily Goal" },
  goal_edit_title:  { so: "Deji Yoolka Maalinlaha", ar: "تحديد الهدف اليومي", en: "Set Daily Goal" },
  goal_edit_sub:    { so: "Immisa jeer ayaad rabtaa inaad maalin kasta gaadho?", ar: "كم مرة تريد الوصول إليها كل يوم؟", en: "How many reps do you want to reach each day?" },
  goal_save:        { so: "Kaydi", ar: "حفظ", en: "Save" },
  toast_goal_saved: { so: "Yoolka waa la dejiyay", ar: "تم تحديد الهدف", en: "Goal set" },
  toast_goal_reached: { so: "Waad gaadhay yoolkaaga maanta! Alhamdulillah 🌙", ar: "لقد بلغت هدفك اليوم! الحمد لله 🌙", en: "You reached today's goal! Alhamdulillah 🌙" }
};

function t(key, lang) {
  const entry = I18N[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}

const DUAS = [
  {
    id: 1,
    arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    transliteration: "Allahumma-kfini bihalalika an haramika, wa aghnini bifadlika amman siwaka",
    t: {
      so: "Ilaahayow, igu filan xalaalkaaga xaraantaada meesheed, oo iga hodmi fadligaaga cid kaaga ah aan ku baahnayn.",
      ar: "اللهم اكفني بحلالك عن حرامك، وأغنني بفضلك عمَّن سواك",
      en: "O Allah, suffice me with what You have made lawful instead of what You have made unlawful, and enrich me by Your favor from dependence on anyone besides You."
    },
    source: "Sunan al-Tirmidhi 3563",
    grade: "Hasan"
  },
  {
    id: 2,
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ",
    transliteration: "Allahumma inni audhu bika minal-hammi wal-hazan, wal-ajzi wal-kasal, wal-bukhli wal-jubn, wa dala-id-dayn, wa ghalabatir-rijal",
    t: {
      so: "Ilaahayow, waxaan kaaga magan galayaa murugada iyo walbahaarka, tabar-darrida iyo caajisnimada, bakhaylnimada iyo fulniinta, culeyska daynta, iyo in dadku igu adkaadaan.",
      ar: "اللهم إني أعوذ بك من الهمِّ والحزن، والعجز والكسل، والبخل والجبن، وضلع الدين، وغلبة الرجال",
      en: "O Allah, I seek refuge in You from worry and grief, helplessness and laziness, miserliness and cowardice, the burden of debt, and being overpowered by other men."
    },
    source: "Sahih al-Bukhari 6363",
    grade: "Sahih"
  },
  {
    id: 3,
    arabic: "اللَّهُمَّ ارْزُقْنِي رِزْقًا حَلَالًا طَيِّبًا وَاسِعًا",
    transliteration: "Allahumma urzuqni rizqan halalan tayyiban wasian",
    t: {
      so: "Ilaahayow, ii xer rizqi xalaal ah, wanaagsan, oo ballaadhan.",
      ar: "اللهم ارزقني رزقا حلالا طيبا واسعا",
      en: "O Allah, grant me halal, good, and abundant provision."
    },
    source: "Majma' al-Zawa'id",
    grade: "Reviewed"
  },
  {
    id: 4,
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal wakeel",
    t: {
      so: "Ilaahay ayaa nagu filan, isaguna waa wakiilka ugu fiican.",
      ar: "حسبنا الله ونعم الوكيل",
      en: "Allah is sufficient for us, and He is the best Disposer of affairs."
    },
    source: "Sahih al-Bukhari 4563",
    grade: "Sahih"
  },
   {
  id: 5,
  arabic: "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ وَالْفُرْقَانِ، اللَّهُمَّ أَنْتَ الْأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ الْآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ، اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ",
  transliteration: "Allahumma Rabba as-samawati as-sab'i wa Rabba al-'arshi al-'azim, Rabbana wa Rabba kulli shay'in, faliq al-habbi wa an-nawa, wa munzila at-tawrati wal-injili wal-furqan. Allahumma anta al-awwalu falaysa qablaka shay'un, wa anta al-akhiru falaysa ba'daka shay'un, wa anta az-zahiru falaysa fawqaka shay'un, wa anta al-batinu falaysa dunaka shay'un. Iqdi 'anna ad-dayna wa aghnina min al-faqr.",
  t: {
    so: "Ilaahow, Eebaha toddobada samood iyo Eebaha Carshiga Weyn, Eebahayo iyo Eebaha wax kasta, Jeexa miraha iyo xudunta, Soo dejiyaha Tawraad, Injiil iyo Furqaan. Ilaahow Adigu waa Kan Hore, wax kaa horreeya ma jiraan, Adiguna waa Kan Dambe, wax kaa dambeeya ma jiraan. Adigu waa Kan Muuqda, wax kaa sarreeya ma jiraan, Adiguna waa Kan Qarsoon, wax kaa hooseeya ma jiraan. Nagaga bixi deynta, naga hodmi faqriga.",
    ar: "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ وَالْفُرْقَانِ، اللَّهُمَّ أَنْتَ الْأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ الْآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ، اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ",
    en: "O Allah, Lord of the seven heavens and Lord of the Mighty Throne, our Lord and Lord of everything, Splitter of the grain and the date-stone, Revealer of the Torah, the Gospel and the Criterion. O Allah, You are the First, so there is nothing before You; You are the Last, so there is nothing after You; You are the Most High, so there is nothing above You; You are the Hidden, so there is nothing beneath You. Settle our debt and enrich us so that we are free of poverty."
  },
  source: "Sahih Muslim 2713",
  grade: "Sahih"
},
  {
    id: 6,
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "La hawla wa la quwwata illa billah",
    t: {
      so: "Ma jiro xoog iyo awood midna aan ahayn Ilaahay mooyaane.",
      ar: "لا حول ولا قوة إلا بالله",
      en: "There is no power and no strength except with Allah."
    },
    source: "Sahih al-Bukhari 6384",
    grade: "Sahih"
  }
   



{
  id: 7,
  arabic: "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ وَالْفُرْقَانِ، اللَّهُمَّ أَنْتَ الْأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ الْآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ، اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ",
  transliteration: "Allahumma Rabba as-samawati as-sab'i wa Rabba al-'arshi al-'azim, Rabbana wa Rabba kulli shay'in, faliq al-habbi wa an-nawa, wa munzila at-tawrati wal-injili wal-furqan. Allahumma anta al-awwalu falaysa qablaka shay'un, wa anta al-akhiru falaysa ba'daka shay'un, wa anta az-zahiru falaysa fawqaka shay'un, wa anta al-batinu falaysa dunaka shay'un. Iqdi 'anna ad-dayna wa aghnina min al-faqr.",
  t: {
    so: "Ilaahow, Eebaha toddobada samood iyo Eebaha Carshiga Weyn, Eebahayo iyo Eebaha wax kasta, Jeexa miraha iyo xudunta, Soo dejiyaha Tawraad, Injiil iyo Furqaan. Ilaahow Adigu waa Kan Hore, wax kaa horreeya ma jiraan, Adiguna waa Kan Dambe, wax kaa dambeeya ma jiraan. Adigu waa Kan Muuqda, wax kaa sarreeya ma jiraan, Adiguna waa Kan Qarsoon, wax kaa hooseeya ma jiraan. Nagaga bixi deynta, naga hodmi faqriga.",
    ar: "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ وَالْفُرْقَانِ، اللَّهُمَّ أَنْتَ الْأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ الْآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ، اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ",
    en: "O Allah, Lord of the seven heavens and Lord of the Mighty Throne, our Lord and Lord of everything, Splitter of the grain and the date-stone, Revealer of the Torah, the Gospel and the Criterion. O Allah, You are the First, so there is nothing before You; You are the Last, so there is nothing after You; You are the Most High, so there is nothing above You; You are the Hidden, so there is nothing beneath You. Settle our debt and enrich us so that we are free of poverty."
  },
  source: "Sahih Muslim 2713",
  grade: "Sahih"
},
];

/* ---------------------------------------------------------------
   2. STORAGE KEYS + PLAIN (non-sensitive) STATE
   --------------------------------------------------------------- */

const K = {
  lang: "dua_lang",
  favs: "dua_favs",
  counts: "dua_counts",
  goals: "dua_goals",
  lockEnabled: "dua_lock_enabled",
  salt: "dua_salt",
  canary: "dua_canary",
  journalEnc: "dua_journal_enc",
  journalPlain: "dua_journal_plain"
};

const DEFAULT_GOAL = 100;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function writeJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

const state = {
  tab: "home",
  lang: localStorage.getItem(K.lang) || "so",
  favs: readJSON(K.favs, []),
  counts: readJSON(K.counts, {}),     // { [duaId]: { count, date } } — resets automatically each new day
  goals: readJSON(K.goals, {}),       // { [duaId]: dailyGoalNumber }
  lockEnabled: localStorage.getItem(K.lockEnabled) === "1",
  unlocked: false,
  journal: [],           // decrypted entries while unlocked, or plaintext entries when no PIN is set
  pendingPin: "",         // scratch pin buffer for entry/setup screens
  pinStage: "enter",      // "enter" | "setup1" | "setup2"
  firstPinValue: "",
  lockError: "",
  speaking: null          // id of dua currently being spoken
};

/* ---------------------------------------------------------------
   3. CRYPTO: PBKDF2 -> AES-GCM, PIN never stored
   --------------------------------------------------------------- */

const te = new TextEncoder();
const td = new TextDecoder();

function toB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function fromB64(str) {
  return Uint8Array.from(atob(str), c => c.charCodeAt(0)).buffer;
}
function randomBytes(n) {
  return crypto.getRandomValues(new Uint8Array(n));
}

async function deriveKey(pin, saltB64) {
  const salt = fromB64(saltB64);
  const baseKey = await crypto.subtle.importKey("raw", te.encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptToStore(key, obj) {
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, te.encode(JSON.stringify(obj)));
  return toB64(iv) + ":" + toB64(ct);
}

async function decryptFromStore(key, packed) {
  const [ivB64, ctB64] = packed.split(":");
  const iv = new Uint8Array(fromB64(ivB64));
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, fromB64(ctB64));
  return JSON.parse(td.decode(pt));
}

async function setupPin(pin) {
  const salt = toB64(randomBytes(16));
  localStorage.setItem(K.salt, salt);
  const key = await deriveKey(pin, salt);
  const canary = await encryptToStore(key, { ok: true });
  localStorage.setItem(K.canary, canary);
  // migrate any entries written before a PIN existed, then drop the plaintext copy
  const existing = readJSON(K.journalPlain, []);
  const journalEnc = await encryptToStore(key, existing);
  localStorage.setItem(K.journalEnc, journalEnc);
  localStorage.removeItem(K.journalPlain);
  localStorage.setItem(K.lockEnabled, "1");
  state.lockEnabled = true;
  state.unlocked = true;
  state.journal = existing;
  sessionKey = key;
}

let sessionKey = null; // AES-GCM key, memory-only, cleared on tab leave/lock

async function tryUnlock(pin) {
  const salt = localStorage.getItem(K.salt);
  const canary = localStorage.getItem(K.canary);
  const journalEnc = localStorage.getItem(K.journalEnc);
  if (!salt || !canary) return false;
  try {
    const key = await deriveKey(pin, salt);
    await decryptFromStore(key, canary); // throws if wrong pin
    state.journal = journalEnc ? await decryptFromStore(key, journalEnc) : [];
    sessionKey = key;
    state.unlocked = true;
    return true;
  } catch {
    return false;
  }
}

async function persistJournal() {
  if (!sessionKey) return;
  const packed = await encryptToStore(sessionKey, state.journal);
  localStorage.setItem(K.journalEnc, packed);
}

function resetJournalCompletely() {
  localStorage.removeItem(K.salt);
  localStorage.removeItem(K.canary);
  localStorage.removeItem(K.journalEnc);
  localStorage.removeItem(K.journalPlain);
  localStorage.removeItem(K.lockEnabled);
  state.lockEnabled = false;
  state.unlocked = false;
  state.journal = [];
  sessionKey = null;
}

/* ---------------------------------------------------------------
   3b. DAILY DHIKR COUNTER (resets automatically each new day)
   --------------------------------------------------------------- */

function getCountFor(id) {
  const rec = state.counts[id];
  if (!rec || rec.date !== todayKey()) return 0;
  return rec.count;
}

function getGoalFor(id) {
  return state.goals[id] || DEFAULT_GOAL;
}

function setGoalFor(id, goal) {
  state.goals[id] = goal;
  writeJSON(K.goals, state.goals);
}

// returns true if this tap just reached the goal (so the UI can celebrate once)
function incrementCount(id) {
  const today = todayKey();
  const rec = state.counts[id];
  const before = (rec && rec.date === today) ? rec.count : 0;
  const after = before + 1;
  state.counts[id] = { count: after, date: today };
  writeJSON(K.counts, state.counts);
  const goal = getGoalFor(id);
  return before < goal && after >= goal;
}

/* ---------------------------------------------------------------
   4. TEXT-TO-SPEECH
   --------------------------------------------------------------- */

// Voices load asynchronously (especially on first page load in Chrome-based
// browsers), so we cache the list and refresh it via onvoiceschanged rather
// than calling getVoices() cold at speak-time — that's the usual reason
// Arabic playback sounds wrong or silently fails on the very first tap.
let cachedVoices = [];
function refreshVoiceCache() {
  if (!("speechSynthesis" in window)) return;
  const list = window.speechSynthesis.getVoices();
  if (list && list.length) cachedVoices = list;
}
function bestArabicVoice() {
  // Prefer a proper Arabic voice; ar-SA first, then any ar-* locale.
  return cachedVoices.find(v => v.lang && v.lang.toLowerCase() === "ar-sa")
      || cachedVoices.find(v => v.lang && v.lang.toLowerCase().startsWith("ar"))
      || null;
}

function speakArabic(id, arabicText, onEnd) {
  if (!("speechSynthesis" in window)) {
    toast(t("toast_tts_error", state.lang));
    return;
  }
  refreshVoiceCache();
  window.speechSynthesis.cancel();

  const arVoice = bestArabicVoice();
  if (!arVoice && cachedVoices.length > 0) {
    // Voices are loaded, but none of them can read Arabic — warn instead of
    // playing a mispronounced fallback voice.
    toast(t("toast_tts_no_voice", state.lang));
  }

  const utter = new SpeechSynthesisUtterance(arabicText);
  utter.lang = "ar-SA";
  utter.rate = 0.78;
  utter.pitch = 1;
  if (arVoice) utter.voice = arVoice;
  utter.onend = () => { state.speaking = null; onEnd && onEnd(); };
  utter.onerror = () => { state.speaking = null; toast(t("toast_tts_error", state.lang)); onEnd && onEnd(); };
  state.speaking = id;
  window.speechSynthesis.speak(utter);
}
function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  state.speaking = null;
}

/* ---------------------------------------------------------------
   5. TOAST + SMALL DOM HELPERS
   --------------------------------------------------------------- */

let toastTimer = null;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

function esc(str) {
  return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function dirFor(lang) { return lang === "ar" ? "rtl" : "ltr"; }

/* ---------------------------------------------------------------
   6. RENDERERS
   --------------------------------------------------------------- */

const view = document.getElementById("view");

function duaCardHTML(item) {
  const lang = state.lang;
  const isFav = state.favs.includes(item.id);
  const isPlaying = state.speaking === item.id;

  const count = getCountFor(item.id);
  const goal = getGoalFor(item.id);
  const pct = Math.max(0, Math.min(1, count / goal));
  const complete = count >= goal;
  const R = 30, C = 2 * Math.PI * R;
  const dashOffset = C * (1 - pct);

  return `
  <article class="dua-card" data-dua="${item.id}">
    <div class="dua-card-head">
      <button class="fav-btn" data-fav="${item.id}" aria-label="favorite">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="${isFav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6"
            d="m12 3.5 2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8Z"/>
        </svg>
      </button>
      <div class="source-block">
        <span class="grade-badge">${esc(item.grade)}</span>
        <div class="source-text">${esc(item.source)}</div>
      </div>
    </div>

    <p class="arabic-text">${item.arabic}</p>
    <p class="translit-text">${esc(item.transliteration)}</p>
    <div class="divider"></div>
    <p class="meaning-label">${esc(t("meaning_label", lang))}</p>
    <p class="meaning-text" dir="${dirFor(lang)}">${esc(item.t[lang])}</p>

    <div class="dua-actions">
      <button class="play-btn ${isPlaying ? "playing" : ""}" data-play="${item.id}">
        ${isPlaying
          ? `<svg viewBox="0 0 24 24" width="15" height="15"><path fill="currentColor" d="M6 6h12v12H6z"/></svg> ${esc(t("stop", lang))}`
          : `<svg viewBox="0 0 24 24" width="15" height="15"><path fill="currentColor" d="M8 5v14l11-7Z"/></svg> ${esc(t("listen", lang))}`}
      </button>

      <div class="dhikr-block">
        <button class="dhikr-ring-btn ${complete ? "complete" : ""}" data-count="${item.id}" aria-label="${esc(t("track", lang))}">
          <svg viewBox="0 0 68 68" width="72" height="72">
            <circle class="dhikr-ring-track" cx="34" cy="34" r="${R}" fill="none" stroke-width="5"/>
            <circle class="dhikr-ring-fill ${complete ? "complete" : ""}" cx="34" cy="34" r="${R}" fill="none" stroke-width="5"
              stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${dashOffset.toFixed(2)}"/>
          </svg>
          <span class="dhikr-center">
            <span class="dhikr-count">${count}</span>
            <span class="dhikr-goal">/${goal}</span>
          </span>
        </button>
        <button class="dhikr-edit-btn" data-goal-edit="${item.id}">${esc(t("goal_label", lang))} · ${goal}</button>
      </div>
    </div>
  </article>`;
}

function renderHome() {
  const lang = state.lang;
  return `
    <div class="hero">
      <div class="hero-crescent" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30"><path fill="currentColor" d="M12.5 2a10 10 0 1 0 8.9 14.5 8.5 8.5 0 0 1-9.6-13.9c.24-.17.1-.55-.2-.55A9.9 9.9 0 0 0 12.5 2Z"/></svg>
      </div>
      <h1 class="hero-title">${esc(t("title", lang))}</h1>
      <p class="hero-sub">${esc(t("tagline", lang))}</p>
    </div>

    <div class="disclaimer">
      <svg viewBox="0 0 24 24" width="17" height="17"><path fill="currentColor" d="M12 2 1 21h22L12 2Zm0 6 1 7h-2l1-7Zm0 9.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"/></svg>
      <p>${esc(t("disclaimer", lang))}</p>
    </div>

    <p class="section-title">${esc(t("dua_of_day", lang))}</p>
    ${duaCardHTML(DUAS[dayIndex()])}
  `;
}

function dayIndex() {
  const day = Math.floor(Date.now() / 86400000);
  return day % DUAS.length;
}

function renderLibrary() {
  const lang = state.lang;
  return `
    <p class="section-title">${esc(t("all_duas", lang))}</p>
    ${DUAS.map(duaCardHTML).join("")}
  `;
}

function renderJournal() {
  const lang = state.lang;

  const inSetupFlow = state.pinStage === "setup1" || state.pinStage === "setup2";
  if (inSetupFlow || (state.lockEnabled && !state.unlocked)) {
    return renderLockScreen();
  }

  const entries = state.journal;
  return `
    <p class="section-title">${esc(t("tab_journal", lang))}</p>
    <textarea class="journal-input" dir="${dirFor(lang)}" id="journalInput"
      placeholder="${esc(t("journal_placeholder", lang))}"></textarea>
    <button class="save-btn" id="journalSave">
      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M5 3h12l4 4v14H5V3Zm2 2v5h9V5H7Zm0 8v6h10v-6H7Z"/></svg>
      ${esc(t("journal_save", lang))}
    </button>

    <div style="margin-top:22px">
      ${entries.length === 0
        ? `<p class="empty-state">${esc(t("journal_empty", lang))}</p>`
        : entries.map(e => `
          <div class="entry">
            <div class="entry-head">
              <span class="entry-date">${esc(e.date)}</span>
              <span class="entry-tag">${esc(t("journal_personal", lang))}</span>
            </div>
            <p class="entry-text" dir="${dirFor(lang)}">${esc(e.text)}</p>
            <button class="entry-del" data-del="${e.id}">${esc(t("delete", lang))}</button>
          </div>`).join("")
      }
    </div>
  `;
}

function renderLockScreen() {
  const lang = state.lang;
  const isSetup = state.pinStage === "setup1" || state.pinStage === "setup2";
  const title = isSetup ? t("lock_setup_title", lang) : t("lock_title", lang);
  const sub = state.pinStage === "setup2" ? t("lock_confirm_sub", lang)
            : isSetup ? t("lock_setup_sub", lang)
            : t("lock_sub", lang);
  const len = state.pendingPin.length;

  return `
    <div class="lock-screen">
      <div class="lock-icon">
        <svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 0 1 6 0v3H9Z"/></svg>
      </div>
      <h2 class="lock-title">${esc(title)}</h2>
      <p class="lock-sub">${esc(sub)}</p>

      <div class="pin-dots">
        ${[0,1,2,3].map(i => `<span class="pin-dot ${i < len ? "filled" : ""} ${state.lockError ? "shake-error" : ""}"></span>`).join("")}
      </div>
      <p class="lock-error">${esc(state.lockError)}</p>

      <div class="pinpad" id="pinpad">
        ${["1","2","3","4","5","6","7","8","9","","0","⌫"].map(k => {
          if (k === "") return `<span></span>`;
          if (k === "⌫") return `<button class="ghost" data-pin="back">⌫</button>`;
          return `<button data-pin="${k}">${k}</button>`;
        }).join("")}
      </div>
    </div>
  `;
}

function renderSettings() {
  const lang = state.lang;
  const langs = [["so","Soomaali"],["ar","العربية"],["en","English"]];
  return `
    <p class="section-title">${esc(t("tab_settings", lang))}</p>

    <p class="field-label">${esc(t("settings_language", lang))}</p>
    <div class="lang-row">
      ${langs.map(([code, name]) => `
        <button class="lang-btn ${state.lang === code ? "active" : ""}" data-lang="${code}">${name}</button>
      `).join("")}
    </div>

    <div class="setting-row">
      <div class="setting-row-text">
        <div class="t">${esc(t("settings_journal_lock", lang))}</div>
        <div class="d">${esc(t("settings_journal_lock_desc", lang))}</div>
      </div>
      <button class="switch ${state.lockEnabled ? "on" : ""}" id="lockToggle" aria-label="toggle lock"></button>
    </div>

    ${state.lockEnabled ? `
      <button class="danger-btn" id="resetJournalBtn">${esc(t("settings_reset_journal", lang))}</button>
    ` : ``}

    <div class="about-block">
      <p>${esc(t("about_line1", lang))}</p>
      <p>${esc(t("about_line2", lang))}</p>
    </div>
  `;
}

function render() {
  document.documentElement.dir = dirFor(state.lang);
  document.documentElement.lang = state.lang;

  let html = "";
  if (state.tab === "home") html = renderHome();
  else if (state.tab === "library") html = renderLibrary();
  else if (state.tab === "journal") html = renderJournal();
  else if (state.tab === "settings") html = renderSettings();
  view.innerHTML = html;

  document.querySelectorAll(".tab-item").forEach(btn => {
    btn.setAttribute("aria-selected", btn.dataset.tab === state.tab ? "true" : "false");
  });

  // re-apply translated tab labels + brand + install text (static header, not re-rendered per view)
  applyStaticI18n();
  bindViewEvents();
}

function applyStaticI18n() {
  const lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n, lang);
  });
}

/* ---------------------------------------------------------------
   7. EVENT BINDING
   --------------------------------------------------------------- */

function bindTabBar() {
  document.querySelectorAll(".tab-item").forEach(btn => {
    btn.addEventListener("click", () => {
      stopSpeaking();
      state.tab = btn.dataset.tab;
      if (state.tab !== "journal") {
        // leaving journal clears the in-memory key for privacy
      }
      render();
    });
  });
}

function bindViewEvents() {
  // favorites
  view.querySelectorAll("[data-fav]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.fav);
      const has = state.favs.includes(id);
      state.favs = has ? state.favs.filter(x => x !== id) : [...state.favs, id];
      writeJSON(K.favs, state.favs);
      toast(t(has ? "toast_fav_off" : "toast_fav_on", state.lang));
      render();
    });
  });

  // play / stop TTS
  view.querySelectorAll("[data-play]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.play);
      const dua = DUAS.find(d => d.id === id);
      if (state.speaking === id) { stopSpeaking(); render(); return; }
      speakArabic(id, dua.arabic, render);
      render();
    });
  });

  // dhikr counter
  view.querySelectorAll("[data-count]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.count);
      const justReached = incrementCount(id);
      if (navigator.vibrate) navigator.vibrate(justReached ? [10, 40, 10] : 12);
      render();
      if (justReached) {
        toast(t("toast_goal_reached", state.lang));
        const ring = view.querySelector(`[data-count="${id}"]`);
        if (ring) {
          ring.classList.add("just-completed");
          setTimeout(() => ring.classList.remove("just-completed"), 400);
        }
      }
    });
  });

  // edit the daily goal for a dua
  view.querySelectorAll("[data-goal-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.goalEdit);
      goalEditModal(id);
    });
  });

  // journal save
  const saveBtn = document.getElementById("journalSave");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const input = document.getElementById("journalInput");
      const text = input.value.trim();
      if (!text) return;
      state.journal = [{ id: Date.now(), text, date: formatDate() }, ...state.journal];
      if (state.lockEnabled) await persistJournal();
      else writeJSON(K.journalPlain, state.journal);
      toast(t("toast_saved", state.lang));
      render();
    });
  }

  // journal delete
  view.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.del);
      confirmModal(t("delete_entry_title", state.lang), t("delete_entry_body", state.lang), async () => {
        state.journal = state.journal.filter(e => e.id !== id);
        if (state.lockEnabled) await persistJournal();
        else writeJSON(K.journalPlain, state.journal);
        toast(t("toast_deleted", state.lang));
        render();
      });
    });
  });

  // pin pad
  const pad = document.getElementById("pinpad");
  if (pad) {
    pad.querySelectorAll("[data-pin]").forEach(btn => {
      btn.addEventListener("click", () => handlePinPress(btn.dataset.pin));
    });
  }

  // settings: language
  view.querySelectorAll("[data-lang]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.lang;
      localStorage.setItem(K.lang, state.lang);
      render();
    });
  });

  // settings: lock toggle
  const lockToggle = document.getElementById("lockToggle");
  if (lockToggle) {
    lockToggle.addEventListener("click", () => {
      if (state.lockEnabled) {
        confirmModal(t("reset_confirm_title", state.lang), t("reset_confirm_body", state.lang), () => {
          resetJournalCompletely();
          toast(t("toast_reset", state.lang));
          render();
        });
      } else {
        state.pinStage = "setup1";
        state.pendingPin = "";
        state.lockError = "";
        state.tab = "journal";
        state.unlocked = false;
        render();
      }
    });
  }

  // settings: full reset
  const resetBtn = document.getElementById("resetJournalBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      confirmModal(t("reset_confirm_title", state.lang), t("reset_confirm_body", state.lang), () => {
        resetJournalCompletely();
        toast(t("toast_reset", state.lang));
        render();
      });
    });
  }
}

function formatDate() {
  const loc = state.lang === "ar" ? "ar-EG" : state.lang === "so" ? "so-SO" : "en-US";
  try { return new Date().toLocaleDateString(loc, { year: "numeric", month: "short", day: "numeric" }); }
  catch { return new Date().toLocaleDateString(); }
}

/* ---------------------------------------------------------------
   8. PIN ENTRY FLOW
   --------------------------------------------------------------- */

async function handlePinPress(key) {
  if (key === "back") {
    state.pendingPin = state.pendingPin.slice(0, -1);
    state.lockError = "";
    render();
    return;
  }
  if (state.pendingPin.length >= 6) return;
  state.pendingPin += key;
  state.lockError = "";

  if (state.pendingPin.length < 4) { render(); return; }

  // 4 digits reached — act depending on stage
  if (state.pinStage === "setup1") {
    state.firstPinValue = state.pendingPin;
    state.pendingPin = "";
    state.pinStage = "setup2";
    render();
    return;
  }

  if (state.pinStage === "setup2") {
    if (state.pendingPin !== state.firstPinValue) {
      state.lockError = t("lock_mismatch", state.lang);
      state.pendingPin = "";
      state.pinStage = "setup1";
      state.firstPinValue = "";
      render();
      return;
    }
    await setupPin(state.pendingPin);
    state.pendingPin = "";
    state.pinStage = "enter";
    toast(t("toast_pin_set", state.lang));
    render();
    return;
  }

  // stage === "enter" -> verify
  const ok = await tryUnlock(state.pendingPin);
  state.pendingPin = "";
  if (!ok) {
    state.lockError = t("lock_wrong", state.lang);
    render();
    return;
  }
  render();
}

/* ---------------------------------------------------------------
   9. CONFIRM MODAL (delete / reset)
   --------------------------------------------------------------- */

function confirmModal(title, body, onConfirm) {
  const lang = state.lang;
  const wrap = document.createElement("div");
  wrap.className = "modal-backdrop";
  wrap.innerHTML = `
    <div class="modal-sheet">
      <h3 class="modal-title">${esc(title)}</h3>
      <p class="modal-body">${esc(body)}</p>
      <div class="modal-actions">
        <button class="modal-cancel">${esc(t("cancel", lang))}</button>
        <button class="modal-confirm">${esc(t("delete", lang))}</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  wrap.querySelector(".modal-cancel").addEventListener("click", () => wrap.remove());
  wrap.addEventListener("click", (e) => { if (e.target === wrap) wrap.remove(); });
  wrap.querySelector(".modal-confirm").addEventListener("click", () => { wrap.remove(); onConfirm(); });
}

function goalEditModal(id) {
  const lang = state.lang;
  const current = getGoalFor(id);
  const wrap = document.createElement("div");
  wrap.className = "modal-backdrop";
  wrap.innerHTML = `
    <div class="modal-sheet">
      <h3 class="modal-title">${esc(t("goal_edit_title", lang))}</h3>
      <p class="modal-body">${esc(t("goal_edit_sub", lang))}</p>
      <input type="number" inputmode="numeric" min="1" max="9999" class="goal-input" id="goalInput" value="${current}">
      <div class="modal-actions">
        <button class="modal-cancel">${esc(t("cancel", lang))}</button>
        <button class="modal-confirm" id="goalSaveBtn" style="background:var(--gold);color:#14210e;">${esc(t("goal_save", lang))}</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  const input = wrap.querySelector("#goalInput");
  input.focus();
  input.select();
  wrap.querySelector(".modal-cancel").addEventListener("click", () => wrap.remove());
  wrap.addEventListener("click", (e) => { if (e.target === wrap) wrap.remove(); });
  const save = () => {
    const val = Math.max(1, Math.min(9999, Math.round(Number(input.value)) || DEFAULT_GOAL));
    setGoalFor(id, val);
    wrap.remove();
    toast(t("toast_goal_saved", state.lang));
    render();
  };
  wrap.querySelector("#goalSaveBtn").addEventListener("click", save);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") save(); });
}

/* ---------------------------------------------------------------
   10. PWA INSTALL PROMPT
   --------------------------------------------------------------- */

let deferredInstall = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstall = e;
  document.getElementById("installBtn").hidden = false;
});
window.addEventListener("appinstalled", () => {
  toast(t("toast_installed", state.lang));
  document.getElementById("installBtn").hidden = true;
});
document.getElementById("installBtn").addEventListener("click", async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  document.getElementById("installBtn").hidden = true;
});

/* ---------------------------------------------------------------
   11. SERVICE WORKER
   --------------------------------------------------------------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => { /* offline support degrades gracefully */ });
  });
}

/* ---------------------------------------------------------------
   12. INIT
   --------------------------------------------------------------- */

// If a lock is configured, journal starts locked every load (session key is memory-only).
// Otherwise load the plaintext entries written before any PIN was ever set.
if (state.lockEnabled) {
  state.pinStage = "enter";
} else {
  state.journal = readJSON(K.journalPlain, []);
}

bindTabBar();
render();

// Voices often arrive asynchronously after page load — prime the cache now,
// and again whenever the browser reports the list has changed.
if ("speechSynthesis" in window) {
  refreshVoiceCache();
  window.speechSynthesis.onvoiceschanged = refreshVoiceCache;
}

})();
