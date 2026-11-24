# Builds data/ot-journeys.json (Old Testament journeys map). Edit the places and routes here, then run:
#   python3 tools/make-ot-journeys.py && python3 tools/stamp.py
import json
C, MODERN, ART, WIKI = {}, {}, {}, {}
def P(id, n, m, ll, short, art, wiki, major=0, **e):
    C[id] = {"n": n, "m": m, "ll": ll, "e": {k[1:]: v for k, v in e.items()}}
    if major: C[id]["major"] = 1
    MODERN[id] = short; ART[id] = art; WIKI[id] = wiki

# ---------- places (e.g. j0=[text, refs]) ----------
P('ur','Ur of the Chaldeans','Tell el-Muqayyar, southern Iraq',[30.963,46.103],'Tell el-Muqayyar','temple ruins'.split(),['Ur','Ziggurat_of_Ur'],1,
  j0=["Abram’s family home. Terah sets out from Ur with Abram, Sarai and Lot, heading for Canaan. God had called Abram here (Acts 7:2–4).","Genesis 11:27–31; Acts 7:2–4"])
P('haran','Haran','Harran, south-east Türkiye',[36.864,39.031],'Harran','walls village'.split(),['Harran','Harran'],1,
  j0=["The family settles in Haran, and Terah dies here. At 75, Abram receives God’s call and promise (“I will make of thee a great nation”) and leaves with Sarai, Lot and all their household.","Genesis 11:31–12:5"],
  j3=["Haran is one of the places the Assyrians had conquered (2 Kings 19:12). The Israelite exiles were taken to Gozan on the Habor river, close by.","2 Kings 17:6; 2 Kings 19:12"])
P('damascus','Damascus','Damascus, Syria',[33.513,36.292],'Damascus','walls city'.split(),['Damascus','Damascus'],0,
  j0=["Abram’s chief servant was “Eliezer of Damascus”, and Abram later pursues the kings who took Lot as far as Hobah, north of Damascus. Tradition places his route into Canaan through here.","Genesis 14:15; Genesis 15:2"],
  j3=["On the main road north. The armies and deportees of Assyria and Babylon passed this way between Israel and Mesopotamia.","2 Kings 16:9"],
  j4=["The returning exiles came home along the same northern road through Syria.","Ezra 1:11"])
P('shechem','Shechem','Tell Balata, Nablus, West Bank',[32.213,35.282],'Nablus (Tell Balata)','walls town'.split(),['Shechem','Nablus'],1,
  j0=["Abram’s first stop in Canaan, at the oak of Moreh. The LORD appears to him and promises, “Unto thy seed will I give this land,” and Abram builds an altar.","Genesis 12:6–7"],
  j2=["Between Mount Ebal and Mount Gerizim, near Shechem, Joshua builds an altar and reads the whole law to Israel, as Moses had commanded. Joshua later gathers the tribes here to renew the covenant.","Joshua 8:30–35; Joshua 24:1–28"])
P('bethel','Bethel','Beitin, West Bank',[31.929,35.240],'Beitin','temple village'.split(),['Bethel','Beitin'],0,
  j0=["Abram camps between Bethel and Ai and builds an altar. He returns here from Egypt, and here he and Lot separate.","Genesis 12:8; Genesis 13:3–12"])
P('egypt_a','Egypt','Nile delta, Egypt',[30.80,31.55],'Nile delta','temple town'.split(),['Ancient_Egypt','Nile_Delta'],0,
  j0=["Famine drives Abram down to Egypt. Fearing for his life, he says Sarai is his sister, and Pharaoh takes her until the LORD strikes his house with plagues.","Genesis 12:10–20"])
P('hebron','Hebron (Mamre)','Hebron, West Bank',[31.532,35.099],'Hebron','walls city'.split(),['Cave_of_the_Patriarchs','Hebron'],1,
  j0=["Abram settles by the oaks of Mamre at Hebron and builds an altar. Here three visitors promise a son to Sarah. He buys the cave of Machpelah to bury Sarah, and he is buried there himself.","Genesis 13:18; Genesis 18:1–15; Genesis 23; Genesis 25:7–10"],
  j2=["Joshua takes Hebron in the southern campaign. Later Caleb, aged 85, asks for Hebron as his inheritance and drives out the Anakim.","Joshua 10:36–37; Joshua 14:6–15"])
P('beersheba','Beersheba','Tel Be’er Sheva, Israel',[31.245,34.840],'Tel Be’er Sheva','walls ruins'.split(),['Tel_Be%27er_Sheva','Beersheba'],0,
  j0=["Abraham digs a well and makes a covenant with Abimelech here, plants a tamarisk tree and calls on the name of the LORD. He sets out from here to Moriah and returns here afterwards.","Genesis 21:22–34; Genesis 22:19"])
P('rameses','Rameses','Qantir (Pi-Ramesses), Egypt',[30.80,31.83],'Qantir','temple ruins'.split(),['Pi-Ramesses','Qantir'],1,
  j1=["Israel had built the store-city of Rameses as slaves. After the tenth plague and the first Passover, about 600,000 men on foot, besides children, set out from Rameses.","Exodus 1:11; Exodus 12:37; Numbers 33:3–5"])
P('succoth','Succoth','Tell el-Maskhuta, Egypt',[30.55,32.10],'Tell el-Maskhuta','walls ruins'.split(),['Tell_el-Maskhuta','Ismailia'],0,
  j1=["Israel’s first camp. God leads them by a pillar of cloud by day and fire by night, not by the shorter road through Philistine country.","Exodus 12:37; Exodus 13:17–22"])
P('redsea','Crossing of the Red Sea','Traditional site: northern Gulf of Suez (location debated)',[29.93,32.56],'Gulf of Suez (traditional)','harbor ruins'.split(),['Crossing_the_Red_Sea','Gulf_of_Suez'],1,
  j1=["Camped by Pi-hahiroth, Israel is trapped between Pharaoh’s army and the sea. Moses stretches out his hand, the waters part, Israel crosses on dry ground, and the waters return over the Egyptians. Where it happened is debated: the Bitter Lakes, the Gulf of Suez and the Gulf of Aqaba have all been proposed.","Exodus 14:1–31; Exodus 15:1–21"])
P('marah','Marah and Elim','Traditionally Ain Hawara and Wadi Gharandel, Sinai',[29.30,32.95],'Wadi Gharandel (traditional)','walls ruins'.split(),['Marah_(Bible)','Sinai_Peninsula'],0,
  j1=["At Marah the water is bitter until Moses throws in a tree and it becomes sweet. At Elim they find twelve springs and seventy palm trees.","Exodus 15:22–27"])
P('rephidim','Wilderness of Sin and Rephidim','Traditionally Wadi Feiran, Sinai',[28.72,33.62],'Wadi Feiran (traditional)','walls ruins'.split(),['Rephidim','Wadi_Feiran'],0,
  j1=["In the wilderness of Sin God sends manna and quail. At Rephidim water flows from the rock, and Israel defeats Amalek while Aaron and Hur hold up Moses’ hands.","Exodus 16; Exodus 17"])
P('sinai','Mount Sinai (Horeb)','Traditionally Jebel Musa, Sinai, Egypt (location debated)',[28.539,33.975],'Jebel Musa (traditional)','mountain mountain'.split(),['Mount_Sinai','Saint_Catherine%27s_Monastery'],1,
  j1=["Israel camps before the mountain for about a year. God gives the Ten Commandments and the law, the covenant is made, the golden calf is judged, and the tabernacle is built. Jebel Musa is the traditional site; others have been proposed in Sinai and in Arabia.","Exodus 19–40; Numbers 10:11–12"])
P('kadesh','Kadesh-barnea','Ain el-Qudeirat, Sinai, Egypt',[30.65,34.42],'Ain el-Qudeirat','walls ruins'.split(),['Kadesh_(Bible)','Ain_el-Qudeirat'],1,
  j1=["Twelve spies go out from here into Canaan. Ten bring a bad report, the people refuse to go in, and God sentences them to forty years in the wilderness. Miriam dies here, and Moses strikes the rock.","Numbers 13–14; Numbers 20:1–13; Deuteronomy 1:19–46"])
P('eziongeber','Ezion-geber','Near Aqaba and Eilat, at the Gulf of Aqaba',[29.55,34.98],'Aqaba / Eilat','harbor coastcity'.split(),['Ezion-Geber','Aqaba'],0,
  j1=["One of the late wilderness camps. Refused passage through Edom, Israel goes south to the Red Sea and around Edom’s land.","Numbers 21:4; Numbers 33:35–36; Deuteronomy 2:8"])
P('hor','Mount Hor','Traditionally Jebel Harun, near Petra, Jordan',[30.317,35.407],'Jebel Harun (traditional)','mountain mountain'.split(),['Mount_Hor','Petra'],0,
  j1=["On the border of Edom, Aaron dies on Mount Hor and his son Eleazar becomes high priest. Soon after, the bronze serpent is lifted up.","Numbers 20:22–29; Numbers 21:4–9"])
P('heshbon','Heshbon','Tell Hisban, Jordan',[31.806,35.810],'Hisban','walls village'.split(),['Heshbon','Hisban'],0,
  j1=["Sihon, king of Heshbon, refuses Israel passage and attacks. Israel defeats him and then Og, king of Bashan, taking the land east of the Jordan.","Numbers 21:21–35; Deuteronomy 2:24–3:11"])
P('moab','Plains of Moab and Mount Nebo','Plains north-east of the Dead Sea; Mount Nebo, Jordan',[31.80,35.64],'Mount Nebo area, Jordan','mountain village'.split(),['Mount_Nebo','Mount_Nebo'],1,
  j1=["Israel camps on the plains of Moab opposite Jericho. Balaam blesses instead of cursing, Moses gives the words of Deuteronomy, and from Mount Nebo he sees the promised land before he dies.","Numbers 22–24; Deuteronomy 1:1–5; Deuteronomy 34"],
  j2=["The starting point. After Moses’ death the LORD tells Joshua, “Be strong and of a good courage.” Two spies are sent from Shittim to Jericho.","Joshua 1; Joshua 2"])
P('gilgal','Gilgal','Near Jericho (exact site uncertain)',[31.855,35.505],'Near Jericho','temple ruins'.split(),['Gilgal','Jericho'],1,
  j2=["The Jordan stops flowing while Israel crosses on dry ground. At Gilgal they set up twelve stones, are circumcised and keep the Passover, and the manna stops. Gilgal is Israel’s base camp for the campaigns.","Joshua 3–5; Joshua 10:15, 43"])
P('jericho','Jericho','Tell es-Sultan, Jericho, West Bank',[31.871,35.444],'Tell es-Sultan','walls ruins'.split(),['Tell_es-Sultan','Jericho'],1,
  j2=["Israel marches around the city for seven days. On the seventh day the people shout, the walls fall down flat, and Rahab and her family are spared.","Joshua 6"])
P('ai','Ai','Probably et-Tell or Khirbet el-Maqatir, West Bank (debated)',[31.917,35.261],'et-Tell (debated)','walls ruins'.split(),['Ai_(Canaan)','Deir_Dibwan'],0,
  j2=["The first attack fails because of Achan’s sin. After Achan is judged, Israel takes Ai with an ambush.","Joshua 7–8"])
P('gibeon','Gibeon','el-Jib, West Bank',[31.847,35.185],'el-Jib','walls village'.split(),['Gibeon_(ancient_city)','Al-Jib'],0,
  j2=["The Gibeonites trick Israel into a treaty. When five Amorite kings attack Gibeon, Joshua marches all night from Gilgal, and the sun stands still while Israel wins the battle.","Joshua 9; Joshua 10:1–14"])
P('lachish','Lachish and the southern cities','Tel Lachish, Israel',[31.565,34.849],'Tel Lachish','walls ruins'.split(),['Lachish','Tel_Lachish'],1,
  j2=["Joshua pursues the five kings by Beth-horon, Azekah and Makkedah, then takes Libnah, Lachish, Eglon, Hebron and Debir: the southern campaign.","Joshua 10:10–43"])
P('hazor','Hazor','Tel Hazor, Israel',[33.017,35.568],'Tel Hazor','walls ruins'.split(),['Tel_Hazor','Tel_Hazor'],1,
  j2=["Jabin king of Hazor gathers the northern kings at the waters of Merom. Israel defeats them, and Joshua burns Hazor, “the head of all those kingdoms”.","Joshua 11:1–15"])
P('shiloh','Shiloh','Khirbet Seilun, West Bank',[32.056,35.290],'Khirbet Seilun','temple ruins'.split(),['Shiloh_(biblical_city)','Shiloh_(biblical_city)'],0,
  j2=["The tabernacle is set up at Shiloh, and the remaining land is divided among the tribes by lot.","Joshua 18:1–10"])
P('samaria','Samaria','Sebastia, West Bank',[32.276,35.197],'Sebastia','walls village'.split(),['Samaria_(ancient_city)','Sebastia,_Nablus'],1,
  j3=["Capital of the northern kingdom, Israel. After a three-year siege it falls to Assyria in 722 BC, and the people are deported because they had turned from the LORD.","2 Kings 17:5–23"])
P('jerusalem','Jerusalem (Mount Moriah)','Jerusalem',[31.778,35.235],'Jerusalem','temple city'.split(),['Solomon%27s_Temple','Jerusalem'],1,
  j0=["Mount Moriah. God tests Abraham: “Take now thy son, thine only son Isaac … and offer him there for a burnt offering.” God provides a ram instead, and Abraham names the place “The LORD will provide.” Solomon later builds the temple on Mount Moriah.","Genesis 22:1–19; 2 Chronicles 3:1"],
  j3=["Babylon takes Jerusalem in three waves: Daniel and others in 605 BC, King Jehoiachin and Ezekiel in 597 BC, and in 586 BC the city and Solomon’s temple are burned and most of the people taken to Babylon.","Daniel 1:1–6; 2 Kings 24:10–16; 2 Kings 25:1–21"],
  j4=["The exiles rebuild the altar and lay the temple’s foundation. The second temple is finished in 516 BC, encouraged by Haggai and Zechariah. Ezra teaches the law, and Nehemiah rebuilds the walls in 52 days.","Ezra 3; Ezra 6:14–15; Ezra 7:10; Nehemiah 6:15"])
P('riblah','Riblah','Near Ribleh, Syria',[34.50,36.55],'Ribleh, Syria','walls village'.split(),['Riblah','Riblah'],0,
  j3=["Nebuchadnezzar’s headquarters. Captured King Zedekiah is brought here; his sons are killed before his eyes, then he is blinded and taken to Babylon.","2 Kings 25:6–7, 20–21; Jeremiah 52:9–11"])
P('carchemish','Carchemish','Karkamış, Türkiye, on the Syrian border',[36.830,38.011],'Karkamış','walls ruins'.split(),['Carchemish','Karkamış'],0,
  j3=["In 605 BC Nebuchadnezzar defeats Egypt here, making Babylon master of Judah. The same year the first exiles, including Daniel, are taken.","Jeremiah 46:2; 2 Kings 24:7"])
P('gozan','Gozan, on the Habor river','Tell Halaf, north-east Syria',[36.827,40.040],'Tell Halaf','walls ruins'.split(),['Tell_Halaf','Tell_Halaf'],0,
  j3=["The king of Assyria places the exiles of Israel “in Halah and in Habor by the river of Gozan, and in the cities of the Medes”.","2 Kings 17:6; 1 Chronicles 5:26"])
P('nineveh','Nineveh','Mosul, Iraq',[36.359,43.152],'Mosul','walls city'.split(),['Nineveh','Mosul'],1,
  j3=["Capital of the Assyrian empire, which carried the northern tribes into exile. Jonah preached here; Nahum foretold its fall, which came in 612 BC.","Jonah 3; Nahum 1–3"])
P('babylon','Babylon','Near Hillah, Iraq',[32.536,44.421],'Babylon (near Hillah)','temple ruins'.split(),['Babylon','Babylon'],1,
  j0=["Abram’s family travelled up the Euphrates from Ur towards Haran, passing through the region later ruled from Babylon (Shinar, Genesis 11:2).","Genesis 11:31"],
  j3=["The exiles settle by the rivers of Babylon (Psalm 137). Daniel serves at the royal court, Ezekiel prophesies by the river Chebar, and Jeremiah writes telling the exiles to seek the peace of the city.","Psalm 137; Daniel 1–6; Ezekiel 1:1–3; Jeremiah 29:4–14"],
  j4=["In 539 BC Babylon falls to Cyrus of Persia. In 538 BC his decree lets the Jews return. About 50,000 go back under Zerubbabel, and Ezra leads another group in 458 BC.","Ezra 1:1–4; Ezra 2:64–65; Ezra 7:1–9; Daniel 5"])
P('susa','Susa (Shushan)','Shush, south-west Iran',[32.190,48.257],'Shush, Iran','temple town'.split(),['Susa','Shush,_Iran'],1,
  j3=["Persian royal city. Daniel sees a vision here, and Esther becomes queen and saves her people.","Daniel 8:2; Esther 1–10"],
  j4=["Nehemiah, cupbearer to King Artaxerxes, hears of Jerusalem’s broken walls and is sent to rebuild them in 445 BC.","Nehemiah 1:1–2:9"])

J = {
 "0": {"chip":"Abraham","name":"Abraham’s journeys","color":"var(--j1)","years":"c. 2100–1990 BC (traditional)",
       "sum":"<b>Abraham’s journeys (Genesis 11:31–25:10).</b> From Ur up the Euphrates to Haran, then, at God’s call, into Canaan: Shechem, Bethel, a famine stay in Egypt, Hebron, Beersheba and Mount Moriah. Conservative chronology places Abraham’s call around 2091 BC; many scholars date the patriarchs later, around 1900–1700 BC."},
 "1": {"chip":"Exodus","name":"The Exodus","color":"var(--j2)","years":"c. 1446–1406 BC (early date)",
       "sum":"<b>The Exodus to the plains of Moab (Exodus 12 to Deuteronomy 34).</b> From Rameses across the sea to Mount Sinai, then to Kadesh-barnea, forty years in the wilderness, around Edom and up to the plains of Moab. Conservative dating places the Exodus around 1446 BC (from 1 Kings 6:1); many scholars prefer around 1260 BC. The route and several sites, including the sea crossing and Mount Sinai, are debated; traditional locations are shown."},
 "2": {"chip":"Conquest","name":"Conquest of Canaan","color":"var(--j4)","years":"c. 1406–1400 BC (early date)",
       "sum":"<b>Joshua’s conquest of Canaan (Joshua 1–24).</b> Across the Jordan to Gilgal and Jericho, then Ai and the covenant at Shechem, the southern campaign after the battle for Gibeon, the northern campaign against Hazor, and the dividing of the land at Shiloh. Routes are simplified, and some sites (such as Ai) are debated."},
 "3": {"chip":"Exile","name":"Exile to Assyria and Babylon","color":"var(--j3)","years":"722 and 605–586 BC",
       "sum":"<b>The exiles (2 Kings 17; 2 Kings 24–25).</b> Israel’s northern kingdom falls to Assyria in 722 BC and its people are deported to the Habor river and Media. Judah is taken to Babylon in three waves (605, 597 and 586 BC), and Jerusalem and the temple are destroyed. Armies and captives followed the curve of the Fertile Crescent, not a straight line across the desert."},
 "4": {"chip":"Return","name":"Return from exile","color":"var(--j7)","years":"538–445 BC",
       "sum":"<b>The return (Ezra and Nehemiah).</b> Cyrus’s decree of 538 BC lets the exiles go home. Zerubbabel leads the first return and the temple is rebuilt by 516 BC; Ezra brings a second group in 458 BC; Nehemiah comes from Susa in 445 BC to rebuild Jerusalem’s walls. Some of the people (like Esther’s family) stayed in the east."}
}
# routes: lists of [lat, lon]
fert_up = [[30.963,46.103],[31.32,45.64],[32.0,45.0],[32.536,44.421],[33.35,43.65],[34.05,42.4],[34.55,40.89],[35.33,40.15],[35.95,39.02],[36.864,39.031]]
R = {
 "0": [ fert_up,
        [[36.864,39.031],[36.83,38.01],[36.2,37.16],[35.13,36.75],[34.5,36.55],[33.513,36.292],[32.75,35.85],[32.213,35.282]],
        [[32.213,35.282],[31.929,35.240],[31.40,34.95],[30.9,34.4],[30.9,33.6],[30.80,32.4],[30.80,31.55]],
        [[30.80,31.55],[30.80,32.4],[30.9,33.6],[30.9,34.4],[31.40,34.95],[31.929,35.240],[31.532,35.099],[31.245,34.840],[31.778,35.235],[31.245,34.840],[31.532,35.099]] ],
 "1": [ [[30.80,31.83],[30.55,32.10],[30.3,32.35],[29.93,32.56],[29.30,32.95],[28.72,33.62],[28.539,33.975]],
        [[28.539,33.975],[29.2,34.3],[30.0,34.4],[30.65,34.42]],
        [[30.65,34.42],[30.1,34.85],[29.55,34.98],[29.9,35.4],[30.317,35.407],[30.9,35.75],[31.45,35.80],[31.806,35.810],[31.80,35.64]] ],
 "2": [ [[31.80,35.64],[31.84,35.55],[31.855,35.505],[31.871,35.444],[31.855,35.505],[31.917,35.261],[32.213,35.282],[31.855,35.505]],
        [[31.855,35.505],[31.847,35.185],[31.88,35.12],[31.70,34.94],[31.62,34.92],[31.565,34.849],[31.532,35.099],[31.42,34.97],[31.855,35.505]],
        [[31.855,35.505],[32.4,35.55],[32.75,35.56],[33.017,35.568],[32.75,35.56],[32.4,35.55],[31.855,35.505]],
        [[31.855,35.505],[32.056,35.290]] ],
 "3": [ [[32.276,35.197],[32.75,35.85],[33.513,36.292],[34.5,36.55],[35.13,36.75],[36.2,37.16],[36.83,38.01],[36.864,39.031],[36.827,40.040],[36.6,41.4],[36.359,43.152]],
        [[31.778,35.235],[32.75,35.85],[33.513,36.292],[34.5,36.55],[35.13,36.75],[36.2,37.16],[36.83,38.01],[35.95,39.02],[35.33,40.15],[34.55,40.89],[34.05,42.4],[33.35,43.65],[32.536,44.421]],
        [[32.536,44.421],[32.4,46.0],[32.190,48.257]] ],
 "4": [ [[32.536,44.421],[33.35,43.65],[34.05,42.4],[34.55,40.89],[35.33,40.15],[35.95,39.02],[36.2,37.16],[35.13,36.75],[34.5,36.55],[33.513,36.292],[32.75,35.85],[31.778,35.235]],
        [[32.190,48.257],[32.4,46.0],[32.536,44.421]] ]
}
# The engine places stops in route order from the C entries that mention the journey; use ENDS for badges
ENDS = {"0":["ur","hebron"],"1":["rameses","moab"],"2":["moab","shiloh"],"3":["samaria","babylon"],"4":["babylon","jerusalem"]}
LABELS = {"0":[37.35,37.2],"1":[28.2,35.6],"2":[32.7,34.3],"3":[35.6,42.8],"4":[33.9,40.2]}
PLACES = [
 ["Great Sea","Mediterranean Sea",[33.6,32.6],"sea"],["Red Sea","Red Sea",[27.6,34.4],"sea"],
 ["Salt Sea","Dead Sea",[31.45,35.48],"sea fine"],["Sea of Chinnereth","Sea of Galilee",[32.84,35.62],"sea fine"],
 ["Persian Gulf","Persian Gulf",[29.3,49.4],"sea"],["Euphrates","Euphrates",[34.2,41.2],"sea fine"],["Tigris","Tigris",[34.6,43.7],"sea fine"],
 ["EGYPT","EGYPT",[29.6,30.6],"land"],["SINAI","SINAI",[29.4,33.5],"land fine"],["CANAAN","ISRAEL",[31.3,34.6],"land fine"],
 ["MOAB","JORDAN",[31.3,36.1],"land fine"],["EDOM","",[30.5,35.65],"land fine"],["ARAM","SYRIA",[34.6,37.6],"land"],
 ["ASSYRIA","",[36.9,42.4],"land fine"],["BABYLONIA","IRAQ",[31.9,45.4],"land"],["ELAM","IRAN",[32.9,47.7],"land fine"],["ARABIAN DESERT","",[31.4,39.4],"land"]
]
D = {"title":"Old Testament journeys","pageTitle":"Old Testament Journeys Map","allChip":"All",
     "allSummary":"<b>Old Testament journeys, c. 2100–445 BC.</b> Abraham, the Exodus, the conquest of Canaan, the exiles and the return. Tap a chip to follow one, or tap a place for what happened there and where to read it. Dates follow conservative chronology; routes are approximate and several sites are debated.",
     "provKey":"No ancient borders shown (they changed over these periods)","compactAll":True,"fitMaxZoom":9,
     "allBounds":[[27.8,30.6],[37.4,48.6]],
     "J":J,"C":C,"MODERN":MODERN,"R":R,"LABELS":LABELS,"ENDS":ENDS,"ART":ART,"WIKI":WIKI,"PLACES":PLACES,"provinceLines":[]}
json.dump(D, open('data/ot-journeys.json','w'), ensure_ascii=False, separators=(',',':'))
print(len(C),'places')
