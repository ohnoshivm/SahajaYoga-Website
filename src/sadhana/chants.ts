import type { Chant, Gloss } from './types'

/**
 * Chant texts with line timings for the bundled recordings.
 *
 * Timings come from a speech-to-text pass over each recording, prompted with the
 * expected text and checked line by line (scratchpad transcripts, 17 Oct 2026).
 * Word meanings are given for the transliteration, in order.
 */

const om: Gloss = { w: 'Om', m: 'the primordial sound, the vibration of creation' }
const twameva: Gloss = { w: 'twameva', m: 'You alone, You indeed (twam, You · eva, alone)' }
const sakshat: Gloss = { w: 'sākshāt', m: 'in person, manifest, incarnate' }
const shri: Gloss = { w: 'Shrī', m: 'the auspicious one; a word of reverence' }
const adiShakti: Gloss[] = [shri, { w: 'Ādi', m: 'first, primordial' }, { w: 'Shakti', m: 'power, the divine energy' }]
const closing: Gloss[] = [
  { w: 'Mātājī', m: 'respected Mother' },
  shri,
  { w: 'Nirmalā', m: 'immaculate, without impurity' },
  { w: 'Devyai', m: 'to the Goddess' },
  { w: 'namo namah', m: 'I bow, again and again' },
]
const CLOSE = {
  deva: 'माताजी श्री निर्मला देव्यै नमो नमः',
  roman: 'Mātājī Shrī Nirmalā Devyai namo namah',
  meaning: 'to Mataji Shri Nirmala Devi, I bow again and again.',
  words: closing,
}

const TEEN: Chant = {
  id: 'teen-mahamantra',
  title: 'Teen Mahamantra',
  script: 'तीन महामन्त्र',
  about: 'The three great mantras to Shri Mataji Nirmala Devi',
  audio: '/audio/teen-mahamantra.mp3',
  duration: 122,
  field: 'white',
  credit: 'Recording: Teen Maha Mantra of Shri Mataji Nirmala Devi Ji',
  verses: [
    {
      title: 'Shri Mahalakshmi, Mahasaraswati, Mahakali',
      lines: [
        { at: 10.6, deva: 'ॐ त्वमेव साक्षात्', roman: 'Om twameva sākshāt', meaning: 'Om. You are, verily and in person,', words: [om, twameva, sakshat] },
        {
          at: 16.4,
          deva: 'श्री महालक्ष्मी महासरस्वती महाकाली',
          roman: 'Shrī Mahālakshmī Mahāsaraswatī Mahākālī',
          meaning: 'Shri Mahalakshmi, Mahasaraswati and Mahakali,',
          words: [
            shri,
            { w: 'Mahālakshmī', m: 'the power of evolution and ascent: the central channel' },
            { w: 'Mahāsaraswatī', m: 'the power of action and creation: the right channel' },
            { w: 'Mahākālī', m: 'the power of desire and existence: the left channel' },
          ],
        },
        {
          at: 29.8,
          deva: 'त्रिगुणात्मिका कुण्डलिनी साक्षात्',
          roman: 'Trigunātmikā Kundalinī sākshāt',
          meaning: 'the three powers in one, the Kundalini in person,',
          words: [
            { w: 'Trigunātmikā', m: 'whose being is the three gunas, the three powers' },
            { w: 'Kundalinī', m: 'the coiled power, the Mother within each of us' },
            sakshat,
          ],
        },
        { at: 36.5, deva: 'श्री आदिशक्ति', roman: 'Shrī Ādi Shakti', meaning: 'the Primordial Power,', words: adiShakti },
        { at: 41.8, ...CLOSE },
      ],
    },
    {
      title: 'Shri Kalki',
      lines: [
        {
          at: 56.6,
          deva: 'ॐ त्वमेव साक्षात् श्री कल्कि साक्षात्',
          roman: 'Om twameva sākshāt Shrī Kalki sākshāt',
          meaning: 'Om. You are, verily, Shri Kalki in person,',
          words: [om, twameva, sakshat, shri, { w: 'Kalki', m: 'the tenth incarnation, who comes with the Last Judgement' }, sakshat],
        },
        { at: 64.4, deva: 'श्री आदिशक्ति', roman: 'Shrī Ādi Shakti', meaning: 'the Primordial Power,', words: adiShakti },
        { at: 68.2, ...CLOSE },
      ],
    },
    {
      title: 'Shri Kalki, Sahasrara Swamini',
      lines: [
        { at: 83.0, deva: 'ॐ त्वमेव साक्षात्', roman: 'Om twameva sākshāt', meaning: 'Om. You are, verily and in person,', words: [om, twameva, sakshat] },
        { at: 88.7, deva: 'श्री कल्कि साक्षात्', roman: 'Shrī Kalki sākshāt', meaning: 'Shri Kalki in person,', words: [shri, { w: 'Kalki', m: 'the tenth incarnation, who comes with the Last Judgement' }, sakshat] },
        {
          at: 93.6,
          deva: 'श्री सहस्रार स्वामिनी',
          roman: 'Shrī Sahasrāra Swāminī',
          meaning: 'the Mistress of the Sahasrara,',
          words: [shri, { w: 'Sahasrāra', m: 'the thousand-petalled lotus at the crown' }, { w: 'Swāminī', m: 'mistress, sovereign' }],
        },
        {
          at: 101.8,
          deva: 'मोक्षप्रदायिनी',
          roman: 'Moksha Pradāyinī',
          meaning: 'the Giver of liberation,',
          words: [{ w: 'Moksha', m: 'liberation, release' }, { w: 'Pradāyinī', m: 'she who bestows' }],
        },
        { at: 103.6, ...CLOSE },
      ],
    },
  ],
}

const Tvam: Gloss = { w: 'Tvaṃ', m: 'You' }
const tvam: Gloss = { w: 'tvaṃ', m: 'You' }
const Ava: Gloss = { w: 'Ava', m: 'protect' }
const ava: Gloss = { w: 'ava', m: 'protect' }

const ATHARVA: Chant = {
  id: 'atharvashirsha',
  title: 'Ganesha Atharvashirsha',
  script: 'श्री गणेश अथर्वशीर्षम्',
  about: 'The Upanishad of Shri Ganesha, who sits on the Mooladhara',
  audio: '/audio/ganesha-atharvashirsha.mp3',
  duration: 179,
  field: 'coral',
  credit: 'Recording: Shri Ganesh Atharvashirsham',
  textNote: 'The recording ends in verse 7; the rest is for reciting',
  verses: [
    {
      title: 'You alone are',
      lines: [
        {
          at: 9.0,
          deva: 'ॐ नमस्ते गणपतये',
          roman: 'Om namaste Gaṇapataye',
          meaning: 'Om. Salutations to You, Ganapati,',
          words: [om, { w: 'namaste', m: 'salutations to You' }, { w: 'Gaṇapataye', m: 'to the Lord of the ganas, the hosts' }],
        },
        {
          at: 13.3,
          deva: 'त्वमेव प्रत्यक्षं तत्त्वमसि',
          roman: 'Tvameva pratyakṣaṃ tattvamasi',
          meaning: 'You alone are That, made visible.',
          words: [{ w: 'Tvameva', m: 'You alone' }, { w: 'pratyakṣaṃ', m: 'before the eyes, visible' }, { w: 'tattvamasi', m: 'You are That: the great saying of the Upanishads' }],
        },
        { at: 17.3, deva: 'त्वमेव केवलं कर्ताऽसि', roman: 'Tvameva kevalaṃ kartāsi', meaning: 'You alone are the creator.', words: [{ w: 'Tvameva', m: 'You alone' }, { w: 'kevalaṃ', m: 'only, entirely' }, { w: 'kartāsi', m: 'are the doer, the creator' }] },
        { at: 22.1, deva: 'त्वमेव केवलं धर्ताऽसि', roman: 'Tvameva kevalaṃ dhartāsi', meaning: 'You alone are the sustainer.', words: [{ w: 'Tvameva', m: 'You alone' }, { w: 'kevalaṃ', m: 'only, entirely' }, { w: 'dhartāsi', m: 'are the one who holds and sustains' }] },
        { at: 26.5, deva: 'त्वमेव केवलं हर्ताऽसि', roman: 'Tvameva kevalaṃ hartāsi', meaning: 'You alone are the destroyer.', words: [{ w: 'Tvameva', m: 'You alone' }, { w: 'kevalaṃ', m: 'only, entirely' }, { w: 'hartāsi', m: 'are the one who takes away, dissolves' }] },
        {
          at: 30.4,
          deva: 'त्वमेव सर्वं खल्विदं ब्रह्मासि',
          roman: 'Tvameva sarvaṃ khalvidaṃ brahmāsi',
          meaning: 'All this is truly You: You are Brahman.',
          words: [{ w: 'Tvameva', m: 'You alone' }, { w: 'sarvaṃ', m: 'all' }, { w: 'khalvidaṃ', m: 'truly, all this' }, { w: 'brahmāsi', m: 'are Brahman, the all-pervading' }],
        },
        {
          at: 36.2,
          deva: 'त्वं साक्षादात्माऽसि नित्यम्',
          roman: 'Tvaṃ sākṣād ātmāsi nityam',
          meaning: 'You are the Spirit, manifest and eternal.',
          words: [Tvam, { w: 'sākṣād', m: 'in person, manifest' }, { w: 'ātmāsi', m: 'are the Self, the Spirit' }, { w: 'nityam', m: 'eternal, always' }],
        },
      ],
    },
    {
      title: 'Truth',
      lines: [
        {
          at: 40.5,
          deva: 'ऋतं वच्मि। सत्यं वच्मि',
          roman: 'Ṛtaṃ vacmi. Satyaṃ vacmi.',
          meaning: 'I speak what is right. I speak the truth.',
          words: [{ w: 'Ṛtaṃ', m: 'the right, the cosmic order' }, { w: 'vacmi.', m: 'I speak' }, { w: 'Satyaṃ', m: 'truth' }, { w: 'vacmi.', m: 'I speak' }],
        },
      ],
    },
    {
      title: 'Protect me',
      lines: [
        { at: 44.0, deva: 'अव त्वं माम्। अव वक्तारम्', roman: 'Ava tvaṃ mām. Ava vaktāram.', meaning: 'Protect me. Protect the one who speaks,', words: [Ava, tvam, { w: 'mām.', m: 'me' }, Ava, { w: 'vaktāram.', m: 'the one who speaks' }] },
        { at: 48.1, deva: 'अव श्रोतारम्। अव दातारम्', roman: 'Ava śrotāram. Ava dātāram.', meaning: 'the one who listens, the one who gives,', words: [Ava, { w: 'śrotāram.', m: 'the one who listens' }, Ava, { w: 'dātāram.', m: 'the one who gives' }] },
        { at: 52.4, deva: 'अव धातारम्। अवानूचानमव शिष्यम्', roman: 'Ava dhātāram. Avānūcānam ava śiṣyam.', meaning: 'the one who keeps this knowledge; protect the teacher and the disciple.', words: [Ava, { w: 'dhātāram.', m: 'the one who holds it' }, { w: 'Avānūcānam', m: 'protect the teacher' }, ava, { w: 'śiṣyam.', m: 'the disciple' }] },
        { at: 57.1, deva: 'अव पश्चात्तात्। अव पुरस्तात्', roman: 'Ava paścāttāt. Ava purastāt.', meaning: 'Protect me from behind and from the front,' },
        { at: 61.1, deva: 'अवोत्तरात्तात्। अव दक्षिणात्तात्', roman: 'Avottarāttāt. Ava dakṣiṇāttāt.', meaning: 'from the north and from the south,' },
        { at: 65.4, deva: 'अव चोर्ध्वात्तात्। अवाधरात्तात्', roman: 'Ava cordhvāttāt. Avādharāttāt.', meaning: 'from above and from below.' },
        { at: 69.6, deva: 'सर्वतो मां पाहि पाहि समन्तात्', roman: 'Sarvato māṃ pāhi pāhi samantāt.', meaning: 'Protect me, protect me, from every side.', words: [{ w: 'Sarvato', m: 'from everywhere' }, { w: 'māṃ', m: 'me' }, { w: 'pāhi', m: 'protect' }, { w: 'pāhi', m: 'protect' }, { w: 'samantāt.', m: 'all around' }] },
      ],
    },
    {
      title: 'You are consciousness',
      lines: [
        { at: 74.7, deva: 'त्वं वाङ्मयस्त्वं चिन्मयः', roman: 'Tvaṃ vāṅmayas tvaṃ cinmayaḥ', meaning: 'You are speech, You are consciousness.' },
        { at: 78.9, deva: 'त्वमानन्दमयस्त्वं ब्रह्ममयः', roman: 'Tvam ānandamayas tvaṃ brahmamayaḥ', meaning: 'You are joy, You are Brahman.' },
        { at: 82.3, deva: 'त्वं सच्चिदानन्दाद्वितीयोऽसि', roman: 'Tvaṃ saccidānandādvitīyo’si', meaning: 'You are truth, consciousness and joy, without a second.', words: [Tvam, { w: 'saccidānandādvitīyo’si', m: 'sat-chit-ananda, truth, attention and joy, one without a second' }] },
        { at: 87.3, deva: 'त्वं प्रत्यक्षं ब्रह्मासि', roman: 'Tvaṃ pratyakṣaṃ brahmāsi', meaning: 'You are Brahman made visible.' },
        { at: 91.1, deva: 'त्वं ज्ञानमयो विज्ञानमयोऽसि', roman: 'Tvaṃ jñānamayo vijñānamayo’si', meaning: 'You are knowledge, and the wisdom beyond it.' },
      ],
    },
    {
      title: 'All this world',
      lines: [
        { at: 94.8, deva: 'सर्वं जगदिदं त्वत्तो जायते', roman: 'Sarvaṃ jagadidaṃ tvatto jāyate', meaning: 'This whole world is born of You,' },
        { at: 99.4, deva: 'सर्वं जगदिदं त्वत्तस्तिष्ठति', roman: 'Sarvaṃ jagadidaṃ tvattas tiṣṭhati', meaning: 'this whole world stands in You,' },
        { at: 103.7, deva: 'सर्वं जगदिदं त्वयि लयमेष्यति', roman: 'Sarvaṃ jagadidaṃ tvayi layam eṣyati', meaning: 'this whole world will dissolve in You,' },
        { at: 108.7, deva: 'सर्वं जगदिदं त्वयि प्रत्येति', roman: 'Sarvaṃ jagadidaṃ tvayi pratyeti', meaning: 'this whole world returns to You.' },
        {
          at: 113.2,
          deva: 'त्वं भूमिरापोऽनलोऽनिलो नभः',
          roman: 'Tvaṃ bhūmir āpo’nalo’nilo nabhaḥ',
          meaning: 'You are earth, water, fire, air and ether.',
          words: [Tvam, { w: 'bhūmir', m: 'earth' }, { w: 'āpo’nalo’nilo', m: 'water, fire, air' }, { w: 'nabhaḥ', m: 'ether, the sky' }],
        },
        { at: 118.1, deva: 'त्वं चत्वारि वाक्पदानि', roman: 'Tvaṃ catvāri vākpadāni', meaning: 'You are the four levels of speech.' },
      ],
    },
    {
      title: 'Beyond the three',
      lines: [
        { at: 121.2, deva: 'त्वं गुणत्रयातीतः', roman: 'Tvaṃ guṇatrayātītaḥ', meaning: 'You are beyond the three gunas,' },
        { at: 124.0, deva: 'त्वं देहत्रयातीतः', roman: 'Tvaṃ dehatrayātītaḥ', meaning: 'beyond the three bodies,' },
        { at: 127.0, deva: 'त्वं कालत्रयातीतः', roman: 'Tvaṃ kālatrayātītaḥ', meaning: 'beyond past, present and future.' },
        {
          at: 130.7,
          deva: 'त्वं मूलाधारस्थितोऽसि नित्यम्',
          roman: 'Tvaṃ mūlādhāra-sthito’si nityam',
          meaning: 'You dwell always in the Mooladhara.',
          words: [Tvam, { w: 'mūlādhāra-sthito’si', m: 'are seated in the Mooladhara, the root chakra' }, { w: 'nityam', m: 'always, eternally' }],
        },
        { at: 134.5, deva: 'त्वं शक्तित्रयात्मकः', roman: 'Tvaṃ śaktitrayātmakaḥ', meaning: 'You are the three powers in one.' },
        { at: 138.1, deva: 'त्वां योगिनो ध्यायन्ति नित्यम्', roman: 'Tvāṃ yogino dhyāyanti nityam', meaning: 'Yogis meditate on You always.' },
        { at: 141.8, deva: 'त्वं ब्रह्मा त्वं विष्णुस्त्वं रुद्रः', roman: 'Tvaṃ brahmā tvaṃ viṣṇus tvaṃ rudraḥ', meaning: 'You are Brahma, You are Vishnu, You are Rudra,' },
        { at: 147.5, deva: 'त्वमिन्द्रस्त्वमग्निस्त्वं वायुः', roman: 'Tvam indras tvam agnis tvaṃ vāyuḥ', meaning: 'You are Indra, You are Agni, You are Vayu,' },
        { at: 152.2, deva: 'त्वं सूर्यस्त्वं चन्द्रमाः', roman: 'Tvaṃ sūryas tvaṃ candramāḥ', meaning: 'You are the sun, You are the moon,' },
        { at: 155.1, deva: 'त्वं ब्रह्म भूर्भुवः स्वरोम्', roman: 'Tvaṃ brahma bhūr bhuvaḥ svarom', meaning: 'You are Brahman: earth, sky and heaven, and Om.' },
      ],
    },
    {
      title: 'The mantra of Ganesha',
      lines: [
        { at: 159.3, deva: 'गणादिं पूर्वमुच्चार्य वर्णादिं तदनन्तरम्', roman: 'Gaṇādiṃ pūrvam uccārya varṇādiṃ tadanantaram', meaning: 'First say “ga”, the start of gana, then “a”, the first of the letters,' },
        { at: 166.1, deva: 'अनुस्वारः परतरः। अर्धेन्दुलसितम्', roman: 'Anusvāraḥ parataraḥ. Ardhendulasitam.', meaning: 'then the nasal sound, shining with the crescent moon,' },
        { at: 171.7, deva: 'तारेण ऋद्धम्। एतत्तव मनुस्वरूपम्', roman: 'Tāreṇa ṛddham. Etat tava manusvarūpam.', meaning: 'joined with Om: this is the form of Your mantra.' },
        { at: 177.3, deva: 'गकारः पूर्वरूपम्। अकारो मध्यमरूपम्', roman: 'Gakāraḥ pūrvarūpam. Akāro madhyamarūpam.', meaning: '“Ga” is its first part, “a” its middle,' },
        { deva: 'अनुस्वारश्चान्त्यरूपम्। बिन्दुरुत्तररूपम्', roman: 'Anusvāraś cāntyarūpam. Bindur uttararūpam.', meaning: 'the nasal its end, and the dot its final form.' },
        { deva: 'नादः सन्धानम्। संहिता सन्धिः', roman: 'Nādaḥ sandhānam. Saṃhitā sandhiḥ.', meaning: 'The sound joins them; together they are one.' },
        { deva: 'सैषा गणेशविद्या', roman: 'Saiṣā gaṇeśavidyā.', meaning: 'This is the knowledge of Ganesha.' },
        { deva: 'गणक ऋषिः। निचृद्गायत्रीच्छन्दः। गणपतिर्देवता', roman: 'Gaṇaka ṛṣiḥ. Nicṛd gāyatrī chandaḥ. Gaṇapatir devatā.', meaning: 'Its seer is Ganaka, its metre Nichrid Gayatri, its deity Ganapati.' },
        { deva: 'ॐ गं गणपतये नमः', roman: 'Om gaṃ gaṇapataye namaḥ', meaning: 'Om gam, salutations to Ganapati.' },
      ],
    },
    {
      title: 'Ganesha Gayatri',
      lines: [
        { deva: 'एकदन्ताय विद्महे। वक्रतुण्डाय धीमहि', roman: 'Ekadantāya vidmahe. Vakratuṇḍāya dhīmahi.', meaning: 'We know the One with a single tusk; we meditate on the One with the curved trunk.' },
        { deva: 'तन्नो दन्ती प्रचोदयात्', roman: 'Tanno dantī pracodayāt.', meaning: 'May the Tusked One inspire us.' },
      ],
    },
    {
      title: 'The form to meditate on',
      lines: [
        { deva: 'एकदन्तं चतुर्हस्तं पाशमङ्कुशधारिणम्', roman: 'Ekadantaṃ caturhastaṃ pāśam aṅkuśa-dhāriṇam', meaning: 'One tusk, four hands, holding the noose and the goad,' },
        { deva: 'रदं च वरदं हस्तैर्बिभ्राणं मूषकध्वजम्', roman: 'Radaṃ ca varadaṃ hastair bibhrāṇaṃ mūṣakadhvajam', meaning: 'the tusk and the hand that grants boons, the mouse on His banner,' },
        { deva: 'रक्तं लम्बोदरं शूर्पकर्णकं रक्तवाससम्', roman: 'Raktaṃ lambodaraṃ śūrpakarṇakaṃ raktavāsasam', meaning: 'red, round-bellied, ears like winnowing fans, robed in red,' },
        { deva: 'रक्तगन्धानुलिप्ताङ्गं रक्तपुष्पैः सुपूजितम्', roman: 'Raktagandhānuliptāṅgaṃ raktapuṣpaiḥ supūjitam', meaning: 'anointed with red sandal, worshipped with red flowers,' },
        { deva: 'भक्तानुकम्पिनं देवं जगत्कारणमच्युतम्', roman: 'Bhaktānukampinaṃ devaṃ jagatkāraṇam acyutam', meaning: 'compassionate to His devotees, the cause of the world, unfailing,' },
        { deva: 'आविर्भूतं च सृष्ट्यादौ प्रकृतेः पुरुषात्परम्', roman: 'Āvirbhūtaṃ ca sṛṣṭyādau prakṛteḥ puruṣāt param', meaning: 'who appeared at the start of creation, beyond nature and spirit.' },
        { deva: 'एवं ध्यायति यो नित्यं स योगी योगिनां वरः', roman: 'Evaṃ dhyāyati yo nityaṃ sa yogī yogināṃ varaḥ', meaning: 'Whoever meditates on Him like this, always, is the best of yogis.' },
      ],
    },
    {
      title: 'Salutations',
      lines: [
        { deva: 'नमो व्रातपतये। नमो गणपतये', roman: 'Namo vrātapataye. Namo gaṇapataye.', meaning: 'Salutations to the Lord of the hosts, to the Lord of the ganas,' },
        { deva: 'नमः प्रमथपतये। नमस्तेऽस्तु लम्बोदरायैकदन्ताय', roman: 'Namaḥ pramathapataye. Namaste’stu lambodarāyaikadantāya', meaning: 'to the Lord of the attendants. Salutations to the round-bellied One with a single tusk,' },
        { deva: 'विघ्ननाशिने शिवसुताय वरदमूर्तये नमः', roman: 'Vighnanāśine śivasutāya varadamūrtaye namaḥ', meaning: 'the destroyer of obstacles, the son of Shiva, the giver of boons: salutations.' },
      ],
    },
  ],
}

export const CHANTS: Record<string, Chant> = { [TEEN.id]: TEEN, [ATHARVA.id]: ATHARVA }
