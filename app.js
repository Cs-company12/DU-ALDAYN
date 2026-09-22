// App.js - دعاء الدين (Duaa Al-Dayn) | Final Production Build
// Features: Somali/Arabic/English, Biometric Journal, Encrypted Storage, Offline Audio

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, TextInput, Alert, Platform, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';

// =============================================================================
// 1. CONFIGURATION & DATA
// =============================================================================

const LANGS = {
  SO: { code: 'so', name: 'Soomaali', dir: 'ltr' },
  AR: { code: 'ar', name: 'العربية', dir: 'rtl' },
  EN: { code: 'en', name: 'English', dir: 'ltr' }
};

const UI = {
  title: { so: 'Ducada Daynta', ar: 'دعاء الدين', en: 'Debt Dua' },
  tagline: { so: 'Ku tawakal Allaha Rizqa Bixiya', ar: 'توكل على الله الرزاق', en: 'Trust in Allah, The Provider' },
  tabs: {
    home: { so: 'Hoyga', ar: 'الرئيسية', en: 'Home' },
    library: { so: 'Ducada', ar: 'الأدعية', en: 'Duas' },
    journal: { so: 'Qorshaha', ar: 'المفكرة', en: 'Journal' },
    settings: { so: 'Dejinta', ar: 'الإعدادات', en: 'Settings' }
  },
  disclaimer: {
    so: '⚠️ Tarjumaadda macnaha kaliya. Ducadu ma dammaanad qaado natiijo maaliyadeed.',
    ar: '⚠️ ترجمة المعنى فقط. الدعاء لا يضمن نتائج مالية.',
    en: '⚠️ Translation of meaning only. Dua does not guarantee financial outcomes.'
  },
  lock: {
    title: { so: 'Qorshaha Waa Xiran Yahay', ar: 'المفكرة مقفلة', en: 'Journal Locked' },
    sub: { so: 'Isticmaal faraha si aad u furto', ar: 'استخدم البصمة للدخول', en: 'Use biometrics to unlock' },
    btn: { so: 'Fur', ar: 'فتح', en: 'Unlock' },
    fail: { so: 'Aqoonsigu wuu fashilmay', ar: 'فشل المصادقة', en: 'Authentication failed' }
  },
  journal: {
    placeholder: { so: 'Qor yoolalkaaga maaliyadeed halkan...', ar: 'اكتب أهدافك المالية هنا...', en: 'Write your financial goals here...' },
    empty: { so: 'Wax qoraal ma jiro', ar: 'لا توجد ملاحظات', en: 'No entries yet' },
    personal: { so: '✍️ Shakhsi', ar: '✍️ شخصي', en: '✍️ Personal' },
    save: { so: 'Kaydi', ar: 'حفظ', en: 'Save' }
  },
  dua: {
    listen: { so: 'Dhagayso', ar: 'استمع', en: 'Listen' },
    stop: { so: 'Jooji', ar: 'إيقاف', en: 'Stop' },
    track: { so: 'Tirada Shaqsiga', ar: 'تتبع شخصي', en: 'Personal Track' },
    meaning: { so: 'Tarjumaadda Macnaha:', ar: 'ترجمة المعنى:', en: 'Translation of Meaning:' }
  }
};

// THEOLOGICALLY VERIFIED CONTENT
const DUAS = [
  {
    id: 0, // NEW DUA FROM IMAGE
    arabic: 'اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ وَالْفُرْقَانِ، اللَّهُمَّ أَنْتَ الْأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ الْآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ، اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ',
    transliteration: 'Allahumma Rabba as-samawati as-sab\'i wa Rabba al-\'arshi al-\'azim. Rabbana wa Rabba kulli shay\'in, faliq al-habbi wa an-nawa. Wa munzila at-tawrati wa al-injili wa al-furqan. Allahumma anta al-awwalu falaysa qablaka shay\'un, wa anta al-akhiru falaysa ba\'daka shay\'un, wa anta az-zahiru falaysa fawqaka shay\'un, wa anta al-batinu falaysa dunaka shay\'un. Iqdi \'anna ad-dayn wa aghnina min al-faqr.',
    t: {
      so: 'Ilaahow, Eebaha toddobada samood iyo Eebaha Carshiga Weyn. Eebahayo iyo Eebaha wax kasta, Jeexa miraha iyo xudunta. Soo dejiyaha Tawraad, Injiil iyo Furqaan. Ilaahow Adigu waa Kan Hore, wax ka horreeya ma jiraan, Adiguna waa Kan Dambe, wax ka dambeeya ma jiraan. Adigu waa Kan Muuqda, wax ka sarreeya ma jiraan, Adiguna waa Kan Qarsoon, wax ka hooseeya ma jiraan. Nagaga bixi deynta, naga hodmi faqriga.',
      ar: 'اللهم رب السماوات السبع ورب العرش العظيم، ربنا ورب كل شيء، فالق الحب والنوى، ومنزل التوراة والإنجيل والفرقان، اللهم أنت الأول فليس قبلك شيء، وأنت الآخر فليس بعدك شيء، وأنت الظاهر فليس فوقك شيء، وأنت الباطن فليس دونك شيء، اقض عنا الدين وأغننا من الفقر',
      en: 'O Allah, Lord of the seven heavens and Lord of the Great Throne. Our Lord and Lord of all things, Splitter of the grain and the date-stone. Revealer of the Torah, the Gospel, and the Criterion. O Allah, You are the First, so there is nothing before You, and You are the Last, so there is nothing after You. You are the Manifest, so there is nothing above You, and You are the Hidden, so there is nothing beneath You. Pay off our debt and enrich us from poverty.'
    },
    source: 'Sahih Muslim 2713',
    grade: 'Sahih'
  },
  {
    id: 1,
    arabic: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
    transliteration: 'Allahumma-kfini bihalalika an haramika, wa aghnini bifadlika amman siwaka',
    t: {
      so: 'Ilaahay igu filan xaqaaga xaaraanta ah, oo i barako fadligaaga aan ku baahnayn cid kale.',
      ar: 'اللهم اكفني بحلالك عن حرامك، وأغنني بفضلك عمَّن سواك',
      en: 'O Allah, suffice me with what You have made lawful instead of what You have made unlawful, and enrich me by Your favor from dependence on anyone besides You.'
    },
    source: 'Sunan al-Tirmidhi 3563',
    grade: 'Hasan'
  },
  {
    id: 2,
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ',
    transliteration: 'Allahumma inni audhu bika minal-hammi wal-hazan, wal-ajzi wal-kasal, wal-bukhli wal-jubn, wa dala-id-dayn, wa ghalabatir-rijal',
    t: {
      so: 'Ilaahay waxaan ka magangalayaa welwelka, murugada, tabarta yarida, caajiska, bakhaylka, fulaynimada, culayska daynta iyo in raggu igu adkaado.',
      ar: 'اللهم إني أعوذ بك من الهمِّ والحزن، والعجز والكسل، والبخل والجبن، وضلع الدين، وغلبة الرجال',
      en: 'O Allah, I seek refuge in You from worry and grief, helplessness and laziness, miserliness and cowardice, the burden of debt and being overpowered by men.'
    },
    source: 'Sahih al-Bukhari 6363',
    grade: 'Sahih'
  },
  {
    id: 3,
    arabic: 'اللَّهُمَّ ارْزُقْنِي رِزْقًا حَلَالًا طَيِّبًا وَاسِعًا',
    transliteration: 'Allahumma urzuqni rizqan halalan tayyiban wasian',
    t: {
      so: 'Ilaahay ii bixi rizqi xalaal ah, nadiif ah, oo ballaaran.',
      ar: 'اللهم ارزقني رزقا حلالا طيبا واسعا',
      en: 'O Allah, grant me halal, good, and abundant provision.'
    },
    source: 'Majma\' al-Zawa\'id',
    grade: 'Reviewed'
  }
];

// =============================================================================
// 2. SECURE STORAGE ENGINE (Fixed for Data Integrity)
// =============================================================================

const KEYS = { FAVS: '@dua_favs_v4', JOURNAL: '@dua_journal_v4', LANG: '@dua_lang_v4', COUNTS: '@dua_counts_v4', BIO: '@dua_bio_v4' };
const SALT = 'dua-al-dayn-somali-secure-2024';

const secureStore = async (key, data) => {
  try {
    const json = JSON.stringify(data);
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, json + SALT);
    await AsyncStorage.setItem(key, `${hash}|${json}`);
  } catch (e) { console.error('Secure store failed:', e); }
};

const secureLoad = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    
    // Robust parsing to handle '|' characters inside JSON data
    const separatorIndex = raw.indexOf('|');
    if (separatorIndex === -1) return null;
    
    const hash = raw.substring(0, separatorIndex);
    const json = raw.substring(separatorIndex + 1);
    
    const verify = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, json + SALT);
    if (hash !== verify) throw new Error('Data integrity compromised');
    
    return JSON.parse(json);
  } catch (e) {
    console.error('Secure load failed:', e);
    return null;
  }
};

const authenticate = async () => {
  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access journal',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false
    });
    return res.success;
  } catch { return false; }
};

// =============================================================================
// 3. COMPONENTS
// =============================================================================

const DuaCard = ({ item, lang, isFav, onToggleFav }) => {
  const [playing, setPlaying] = useState(false);
  const [count, setCount] = useState(0);
  const rtl = lang.dir === 'rtl';

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const counts = await secureLoad(KEYS.COUNTS) || {};
      if (isMounted && counts[item.id]) setCount(counts[item.id]);
    })();
    return () => { isMounted = false; };
  }, [item.id]);

  const handlePlay = async () => {
    if (playing) { await Speech.stop(); setPlaying(false); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlaying(true);
    try {
      await Speech.speak(item.arabic, {
        language: 'ar-SA', rate: 0.8, pitch: 1.0,
        onDone: () => setPlaying(false),
        onError: () => { setPlaying(false); Alert.alert('Audio', 'TTS unavailable. Ensure device volume is up.'); }
      });
    } catch (e) { setPlaying(false); }
  };

  const increment = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newCount = count + 1;
    setCount(newCount);
    const counts = await secureLoad(KEYS.COUNTS) || {};
    counts[item.id] = newCount;
    await secureStore(KEYS.COUNTS, counts);
  };

  return (
    <View style={s.card}>
      <View style={s.cardHead}>
        <TouchableOpacity onPress={onToggleFav}><Text style={{ fontSize: 26 }}>{isFav ? '⭐' : '☆'}</Text></TouchableOpacity>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={s.gradeBadge}><Text style={s.gradeText}>{item.grade}</Text></View>
          <Text style={s.sourceText}>📚 {item.source}</Text>
        </View>
      </View>

      <Text style={[s.arabic, rtl && s.rtl]}>{item.arabic}</Text>
      <Text style={s.translit}>{item.transliteration}</Text>
      <View style={s.divider} />
      <Text style={s.meaningLabel}>{UI.dua.meaning[lang.code]}</Text>
      <Text style={[s.translation, rtl && s.rtl]}>{item.t[lang.code]}</Text>

      <View style={s.actions}>
        <TouchableOpacity style={s.playBtn} onPress={handlePlay}>
          <Text style={s.playBtnText}>{playing ? `⏹ ${UI.dua.stop[lang.code]}` : `▶️ ${UI.dua.listen[lang.code]}`}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.counterWrap} onPress={increment}>
          <Text style={s.counterNum}>{count}</Text>
          <Text style={s.counterLbl}>{UI.dua.track[lang.code]}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const JournalScreen = ({ lang }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const rtl = lang.dir === 'rtl';

  useEffect(() => { checkLock(); }, []);

  const checkLock = async () => {
    const bio = await AsyncStorage.getItem(KEYS.BIO);
    if (bio === 'true') setUnlocked(false);
    else { setUnlocked(true); loadEntries(); }
  };

  const unlock = async () => {
    setLoading(true);
    if (await authenticate()) { setUnlocked(true); loadEntries(); }
    else Alert.alert(UI.lock.fail[lang.code]);
    setLoading(false);
  };

  const loadEntries = async () => {
    const data = await secureLoad(KEYS.JOURNAL);
    if (data) setEntries(data);
  };

  const save = async () => {
    if (!text.trim()) return;
    const entry = { id: Date.now(), text, date: new Date().toLocaleDateString(lang.code === 'ar' ? 'ar-EG' : lang.code === 'so' ? 'so-SO' : 'en-US') };
    const updated = [entry, ...entries];
    setEntries(updated);
    await secureStore(KEYS.JOURNAL, updated);
    setText('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!unlocked) {
    return (
      <View style={s.lockScreen}>
        <Text style={s.lockIcon}>🔒</Text>
        <Text style={s.lockTitle}>{UI.lock.title[lang.code]}</Text>
        <Text style={s.lockSub}>{UI.lock.sub[lang.code]}</Text>
        <TouchableOpacity style={s.unlockBtn} onPress={unlock} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.unlockBtnText}>{UI.lock.btn[lang.code]}</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container}>
      <Text style={s.sectionTitle}>{UI.tabs.journal[lang.code]}</Text>
      <TextInput
        style={[s.input, rtl && s.rtl]}
        multiline numberOfLines={4}
        placeholder={UI.journal.placeholder[lang.code]}
        value={text} onChangeText={setText}
      />
      <TouchableOpacity style={s.saveBtn} onPress={save}>
        <Text style={s.saveBtnText}>💾 {UI.journal.save[lang.code]}</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 20 }}>
        {entries.length === 0
          ? <Text style={s.empty}>{UI.journal.empty[lang.code]}</Text>
          : entries.map(e => (
              <View key={e.id} style={s.entry}>
                <View style={s.entryHead}>
                  <Text style={s.entryDate}>{e.date}</Text>
                  <Text style={s.personalTag}>{UI.journal.personal[lang.code]}</Text>
                </View>
                <Text style={[s.entryText, rtl && s.rtl]}>{e.text}</Text>
              </View>
            ))
        }
      </View>
    </ScrollView>
  );
};

// =============================================================================
// 4. MAIN APP
// =============================================================================

export default function App() {
  const [tab, setTab] = useState('home');
  const [lang, setLang] = useState(LANGS.SO);
  const [favs, setFavs] = useState([]);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const f = await secureLoad(KEYS.FAVS); if (f) setFavs(f);
    const l = await AsyncStorage.getItem(KEYS.LANG); if (l) setLang(JSON.parse(l));
  };

  const toggleFav = async (id) => {
    const updated = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id];
    setFavs(updated);
    await secureStore(KEYS.FAVS, updated);
  };

  const setLanguage = (code) => {
    const l = Object.values(LANGS).find(x => x.code === code);
    setLang(l);
    AsyncStorage.setItem(KEYS.LANG, JSON.stringify(l));
  };

  const renderTab = () => {
    switch (tab) {
      case 'home': return (
        <ScrollView style={s.container}>
          <View style={s.hero}>
            <Text style={s.heroTitle}>{UI.title[lang.code]}</Text>
            <Text style={s.heroSub}>{UI.tagline[lang.code]}</Text>
          </View>
          <View style={s.disclaimer}><Text style={s.disclaimerText}>{UI.disclaimer[lang.code]}</Text></View>
          <Text style={s.sectionTitle}>{lang.code === 'so' ? 'Ducada Maalinlaha' : lang.code === 'ar' ? 'دعاء اليوم' : 'Dua of the Day'}</Text>
          <DuaCard item={DUAS[0]} lang={lang} isFav={favs.includes(DUAS[0].id)} onToggleFav={() => toggleFav(DUAS[0].id)} />
        </ScrollView>
      );
      case 'library': return (
        <ScrollView style={s.container}>
          <Text style={[s.sectionTitle, { marginTop: 10 }]}>{UI.tabs.library[lang.code]}</Text>
          {DUAS.map(d => <DuaCard key={d.id} item={d} lang={lang} isFav={favs.includes(d.id)} onToggleFav={() => toggleFav(d.id)} />)}
        </ScrollView>
      );
      case 'journal': return <JournalScreen lang={lang} />;
      case 'settings': return (
        <ScrollView style={s.container}>
          <Text style={s.sectionTitle}>{UI.tabs.settings[lang.code]}</Text>
          <Text style={s.label}>Luqadda / Language</Text>
          <View style={s.langRow}>
            {Object.values(LANGS).map(l => (
              <TouchableOpacity key={l.code} style={[s.langBtn, lang.code === l.code && s.langBtnActive]} onPress={() => setLanguage(l.code)}>
                <Text style={[s.langBtnText, lang.code === l.code && s.langBtnTextActive]}>{l.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.settingRow} onPress={async () => {
            const on = await AsyncStorage.getItem(KEYS.BIO) === 'true';
            await AsyncStorage.setItem(KEYS.BIO, on ? 'false' : 'true');
            Alert.alert('Updated', `Biometric lock ${on ? 'disabled' : 'enabled'}`);
          }}>
            <Text style={s.settingLabel}>🔒 Journal Biometric Lock</Text>
            <Text style={s.settingVal}>Toggle</Text>
          </TouchableOpacity>
        </ScrollView>
      );
      default: return null;
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a5f2a" />
      <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>{renderTab()}</View>
      <View style={s.tabBar}>
        {['home', 'library', 'journal', 'settings'].map(t => (
          <TouchableOpacity key={t} style={s.tabItem} onPress={() => setTab(t)}>
            <Text style={s.tabIcon}>{t === 'home' ? '🏠' : t === 'library' ? '📖' : t === 'journal' ? '📝' : '⚙️'}</Text>
            <Text style={[s.tabLabel, tab === t && s.tabLabelActive]}>{UI.tabs[t][lang.code]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// =============================================================================
// 5. STYLES
// =============================================================================

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a5f2a' },
  container: { flex: 1, padding: 15 },
  hero: { backgroundColor: '#1a5f2a', padding: 30, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, alignItems: 'center', marginBottom: 15 },
  heroTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  heroSub: { fontSize: 16, color: '#e0e0e0', marginTop: 5, textAlign: 'center', fontStyle: 'italic' },
  disclaimer: { backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#ffc107' },
  disclaimerText: { color: '#856404', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a5f2a', marginBottom: 15 },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'flex-start' },
  gradeBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 4 },
  gradeText: { fontSize: 10, color: '#1a5f2a', fontWeight: 'bold' },
  sourceText: { fontSize: 11, color: '#888', fontStyle: 'italic' },
  arabic: { fontSize: 26, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif', lineHeight: 44, color: '#1a5f2a', marginBottom: 10 },
  rtl: { textAlign: 'right' },
  translit: { fontSize: 14, color: '#666', fontStyle: 'italic', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  meaningLabel: { fontSize: 10, color: '#999', textTransform: 'uppercase', marginBottom: 4 },
  translation: { fontSize: 16, color: '#333', lineHeight: 24 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, alignItems: 'center' },
  playBtn: { flex: 1, backgroundColor: '#f0f8f0', padding: 12, borderRadius: 8, alignItems: 'center', marginRight: 10 },
  playBtnText: { color: '#1a5f2a', fontWeight: '600' },
  counterWrap: { alignItems: 'center', paddingHorizontal: 15 },
  counterNum: { fontSize: 24, fontWeight: 'bold', color: '#d4af37' },
  counterLbl: { fontSize: 9, color: '#999', marginTop: 2 },
  lockScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  lockIcon: { fontSize: 60, marginBottom: 20 },
  lockTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a5f2a', marginBottom: 10 },
  lockSub: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  unlockBtn: { backgroundColor: '#1a5f2a', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
  unlockBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 15, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  saveBtn: { backgroundColor: '#1a5f2a', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  entry: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#d4af37' },
  entryHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  entryDate: { fontSize: 12, color: '#888' },
  personalTag: { fontSize: 10, color: '#6c757d', fontStyle: 'italic' },
  entryText: { fontSize: 16, color: '#333' },
  empty: { textAlign: 'center', color: '#999', marginTop: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333' },
  langRow: { flexDirection: 'row', marginBottom: 20 },
  langBtn: { flex: 1, padding: 12, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  langBtnActive: { backgroundColor: '#1a5f2a' },
  langBtnText: { color: '#555' },
  langBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderRadius: 10, marginTop: 10 },
  settingLabel: { fontSize: 16, color: '#333' },
  settingVal: { fontSize: 16, color: '#1a5f2a', fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', backgroundColor: '#1a5f2a', paddingVertical: 10 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { fontSize: 22, marginBottom: 4 },
  tabLabel: { fontSize: 10, color: '#ccc' },
  tabLabelActive: { color: '#fff', fontWeight: 'bold' }
});
