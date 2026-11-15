// Signaalwoorden per tekstverband (bron: Signaalwoorden_V1.pdf)
window.VERBANDEN = [
  { id: "tijd", label: "tijd", woorden: ["vroeger", "voordat", "eerst", "zodra", "intussen", "tijdens", "terwijl", "daarna", "nadat", "vervolgens", "ten slotte", "wanneer"] },
  { id: "oorzaak", label: "oorzaak-gevolg", woorden: ["als gevolg van", "daardoor", "vanwege", "dat komt door", "door", "doordat", "wegens", "ten gevolge van", "waardoor", "want"] },
  { id: "vergelijking", label: "overeenkomst / vergelijking", woorden: ["evenals", "evenzeer", "hetzelfde als", "is vergelijkbaar met", "lijkt op", "net als", "zie ook"] },
  { id: "doel", label: "doel-middel", woorden: ["daarmee", "daartoe", "door middel van", "met", "met de bedoeling", "om te"] },
  { id: "reden", label: "reden / verklaring / argument", woorden: ["aangezien", "daarom", "immers", "namelijk", "om die reden", "omdat", "op grond van", "want"] },
  { id: "toelichting", label: "toelichting / voorbeeld", woorden: ["bijvoorbeeld", "dat wil zeggen", "een voorbeeld", "je moet daarbij denken aan", "onder andere", "denk aan", "stel je voor", "zo", "zoals"] },
  { id: "opsomming", label: "opsomming", woorden: ["ten eerste, ten tweede", "in de eerste plaats", "om te beginnen", "niet alleen ... maar ook", "een andere reden", "ook", "vervolgens", "bovendien", "daarnaast", "en", "verder", "ten slotte", "als laatste"] },
  { id: "tegenstelling", label: "tegenstelling", woorden: ["aan de ene kant, aan de andere kant", "enerzijds ... anderzijds", "in tegenstelling tot", "daar staat tegenover", "daarentegen", "desondanks", "echter", "hoewel", "integendeel", "maar", "niettemin", "desalniettemin", "ondanks", "toch", "weliswaar ... maar"] },
  { id: "voorwaarde", label: "voorwaarde", woorden: ["op voorwaarde dat", "als", "indien", "mits", "tenzij"] },
  { id: "samenvatting", label: "samenvatting / herhaling", woorden: ["al met al", "met andere woorden", "het komt erop neer dat", "kortom", "ofwel / oftewel", "samengevat", "terugblikkend", "zoals gezegd"] },
  { id: "conclusie", label: "conclusie", woorden: ["concluderend", "dus", "hieruit volgt", "uit dit alles blijkt", "vandaar dat"] }
];

// Verbanden die erg op elkaar lijken: deze worden nooit als fout antwoord naast elkaar gezet.
window.VERBANDEN_BUREN = [
  ["oorzaak", "reden"],
  ["samenvatting", "conclusie"]
];

// Zinnen aanvullen: het juiste signaalwoord + 3 woorden die niet passen.
window.ZINNEN = [
  { zin: "Ik had geen ontbijt gegeten. ___ had ik in de pauze veel honger.", goed: "Daardoor", fout: ["Maar", "Bijvoorbeeld", "Tenzij"], verband: "oorzaak" },
  { zin: "Je mag buitenspelen, ___ je eerst je huiswerk af hebt.", goed: "op voorwaarde dat", fout: ["doordat", "bovendien", "kortom"], verband: "voorwaarde" },
  { zin: "Het regende hard. ___ gingen we naar het strand.", goed: "Toch", fout: ["Daardoor", "Namelijk", "Zodra"], verband: "tegenstelling" },
  { zin: "___ je thuiskomt, moet je de hond uitlaten.", goed: "Zodra", fout: ["Hoewel", "Daarom", "Bijvoorbeeld"], verband: "tijd" },
  { zin: "Veel dieren houden een winterslaap, ___ de egel en de beer.", goed: "zoals", fout: ["daardoor", "tenzij", "echter"], verband: "toelichting" },
  { zin: "Ik blijf vandaag thuis. Ik ben ___ ziek.", goed: "namelijk", fout: ["vervolgens", "daarentegen", "kortom"], verband: "reden" },
  { zin: "Mijn broer houdt van voetbal. Ik ___ hou meer van tekenen.", goed: "daarentegen", fout: ["daardoor", "zodra", "dus"], verband: "tegenstelling" },
  { zin: "We gaan morgen naar de dierentuin, ___ het gaat regenen.", goed: "tenzij", fout: ["daarom", "net als", "bijvoorbeeld"], verband: "voorwaarde" },
  { zin: "Eerst deden we onze jassen uit. ___ gingen we aan tafel zitten.", goed: "Daarna", fout: ["Daarentegen", "Want", "Tenzij"], verband: "tijd" },
  { zin: "Lotte is heel goed in rekenen, ___ haar zus.", goed: "net als", fout: ["omdat", "tenzij", "desondanks"], verband: "vergelijking" },
  { zin: "Hij spaart al maanden ___ een nieuwe fiets te kopen.", goed: "om", fout: ["tenzij", "echter", "kortom"], verband: "doel" },
  { zin: "___ zijn gebroken been kon hij niet meedoen aan de wedstrijd.", goed: "Vanwege", fout: ["Ondanks", "Zoals", "Tenzij"], verband: "oorzaak" },
  { zin: "Een hond is een fijn huisdier. Hij is trouw en ___ is hij lekker om mee te knuffelen.", goed: "bovendien", fout: ["tenzij", "daarentegen", "zodra"], verband: "opsomming" },
  { zin: "Er zijn veel redenen om te lezen. ___ leer je er nieuwe woorden van.", goed: "Ten eerste", fout: ["Tenzij", "Daarentegen", "Desondanks"], verband: "opsomming" },
  { zin: "We hebben gezwommen, gefietst en gewandeld. ___, het was een sportieve dag.", goed: "Kortom", fout: ["Doordat", "Tenzij", "Zodra"], verband: "samenvatting" },
  { zin: "Het is heel koud buiten, ___ moet je je muts opzetten.", goed: "dus", fout: ["hoewel", "tenzij", "zoals"], verband: "conclusie" },
  { zin: "___ hij hard had geleerd, haalde hij toch een onvoldoende.", goed: "Hoewel", fout: ["Doordat", "Omdat", "Zodra"], verband: "tegenstelling" },
  { zin: "Je kunt een vulkaan nabouwen ___ azijn en bakpoeder.", goed: "door middel van", fout: ["in tegenstelling tot", "op voorwaarde dat", "kortom"], verband: "doel" },
  { zin: "Ik neem een paraplu mee, ___ het gaat zo regenen.", goed: "want", fout: ["toch", "tenzij", "bovendien"], verband: "reden" },
  { zin: "Tijgers eten vlees. Koeien eten ___ alleen gras.", goed: "echter", fout: ["daardoor", "namelijk", "zodra"], verband: "tegenstelling" },
  { zin: "___ de juf aan het uitleggen was, stond Sem op en liep weg.", goed: "Terwijl", fout: ["Daarom", "Kortom", "Bijvoorbeeld"], verband: "tijd" },
  { zin: "Je mag mee naar de film, ___ je om negen uur thuis bent.", goed: "mits", fout: ["ondanks", "zoals", "daarom"], verband: "voorwaarde" },
  { zin: "Het is 's ochtends lang donker. ___ de korte dagen in de winter.", goed: "Dat komt door", fout: ["Daarentegen", "Bijvoorbeeld", "Met andere woorden"], verband: "oorzaak" },
  { zin: "Sporten is gezond. ___ is het ook nog eens heel leuk.", goed: "Daarnaast", fout: ["Tenzij", "Doordat", "Zodra"], verband: "opsomming" },
  { zin: "Mijn opa heeft veel pijn. ___ is hij altijd vrolijk.", goed: "Desondanks", fout: ["Daardoor", "Namelijk", "Bijvoorbeeld"], verband: "tegenstelling" },
  { zin: "Mijn zus wil dierenarts worden. Ze is ___ gek op dieren.", goed: "immers", fout: ["tenzij", "vervolgens", "zodra"], verband: "reden" },
  { zin: "In de dierentuin zie je allerlei dieren, ___ olifanten, giraffen en leeuwen.", goed: "onder andere", fout: ["daardoor", "hoewel", "tenzij"], verband: "toelichting" },
  { zin: "We kregen geen antwoord op onze vraag. ___ zijn we het zelf gaan opzoeken.", goed: "Daarom", fout: ["Tenzij", "Hoewel", "Zoals"], verband: "reden" },
  { zin: "Het eten was lekker, de bus was op tijd en het weer was mooi. ___ was het een geslaagd schoolreisje.", goed: "Al met al", fout: ["Tenzij", "Doordat", "Zodra"], verband: "samenvatting" },
  { zin: "Mijn kamer is niet groot, ___ ik vind hem wel heel gezellig.", goed: "maar", fout: ["doordat", "zoals", "daarom"], verband: "tegenstelling" },
  { zin: "Een wolf ___ een hond, maar hij leeft in het wild.", goed: "lijkt op", fout: ["doordat", "tenzij", "daarom"], verband: "vergelijking" },
  { zin: "Bij alle proeven groeiden de planten in de zon het best. ___ planten zonlicht nodig hebben.", goed: "Hieruit volgt dat", fout: ["Desondanks", "Bijvoorbeeld", "Net als"], verband: "conclusie" },
  { zin: "___ de film begon, kochten we nog snel popcorn.", goed: "Voordat", fout: ["Doordat", "Hoewel", "Zoals"], verband: "tijd" },
  { zin: "___ het eten klaar was, gingen we aan tafel.", goed: "Nadat", fout: ["Tenzij", "Hoewel", "Want"], verband: "tijd" },
  { zin: "Planten hebben water nodig. ___ hebben ze zonlicht nodig.", goed: "Verder", fout: ["Tenzij", "Doordat", "Hoewel"], verband: "opsomming" },
  { zin: "Hij had geen zin om te lezen. ___ pakte hij een boek.", goed: "Niettemin", fout: ["Daardoor", "Namelijk", "Zodra"], verband: "tegenstelling" },
  { zin: "Ik koop een nieuwe tas, ___ mijn oude tas kapot is.", goed: "aangezien", fout: ["hoewel", "tenzij", "bijvoorbeeld"], verband: "reden" },
  { zin: "Je doet je best, je let goed op en je maakt je huiswerk. ___: je bent een prima leerling!", goed: "Samengevat", fout: ["Tenzij", "Doordat", "Daarentegen"], verband: "samenvatting" },
  { zin: "Insecten hebben zes poten, ___ een mier en een bij.", goed: "bijvoorbeeld", fout: ["daardoor", "tenzij", "hoewel"], verband: "toelichting" },
  { zin: "___ zijn broer houdt Daan helemaal niet van snoep.", goed: "In tegenstelling tot", fout: ["Doordat", "Tenzij", "Zodra"], verband: "tegenstelling" },
  { zin: "Het museum was een maand dicht ___ een verbouwing.", goed: "wegens", fout: ["hoewel", "zoals", "tenzij"], verband: "oorzaak" },
  { zin: "Je moet je fietslampjes aanzetten ___ het donker is.", goed: "wanneer", fout: ["hoewel", "zoals", "daarom"], verband: "tijd" }
];
