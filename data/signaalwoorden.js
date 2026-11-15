// Signaalwoorden per tekstverband (bron: Signaalwoorden_V1.pdf)
window.VERBANDEN = [
  { id: "tijd", label: "tijd", uitleg: "Op welk moment gebeurt iets? Het gaat over het moment of de volgorde.", woorden: ["vroeger", "voordat", "eerst", "zodra", "intussen", "tijdens", "terwijl", "daarna", "nadat", "vervolgens", "ten slotte", "wanneer"] },
  { id: "oorzaak", label: "oorzaak-gevolg", uitleg: "Het ene zorgt ervoor dat het andere gebeurt.", woorden: ["als gevolg van", "daardoor", "vanwege", "dat komt door", "door", "doordat", "wegens", "ten gevolge van", "waardoor", "want"] },
  { id: "vergelijking", label: "overeenkomst / vergelijking", uitleg: "Twee dingen lijken op elkaar of worden naast elkaar gelegd.", woorden: ["evenals", "evenzeer", "hetzelfde als", "is vergelijkbaar met", "lijkt op", "net als", "zie ook"] },
  { id: "doel", label: "doel-middel", uitleg: "Hoe bereik je iets, of waarvoor doe je iets?", woorden: ["daarmee", "daartoe", "door middel van", "met", "met de bedoeling", "om te"] },
  { id: "reden", label: "reden / verklaring / argument", uitleg: "Er wordt uitgelegd waarom iemand iets doet of vindt.", woorden: ["aangezien", "daarom", "immers", "namelijk", "om die reden", "omdat", "op grond van", "want"] },
  { id: "toelichting", label: "toelichting / voorbeeld", uitleg: "Er komt extra uitleg of een geval om het duidelijk te maken.", woorden: ["bijvoorbeeld", "dat wil zeggen", "een voorbeeld", "je moet daarbij denken aan", "onder andere", "denk aan", "stel je voor", "zo", "zoals"] },
  { id: "opsomming", label: "opsomming", uitleg: "Er worden meerdere dingen achter elkaar genoemd.", woorden: ["ten eerste, ten tweede", "in de eerste plaats", "om te beginnen", "niet alleen ... maar ook", "een andere reden", "ook", "vervolgens", "bovendien", "daarnaast", "en", "verder", "ten slotte", "als laatste"] },
  { id: "tegenstelling", label: "tegenstelling", uitleg: "Het ene is anders dan het andere, of anders dan je verwacht.", woorden: ["aan de ene kant, aan de andere kant", "enerzijds ... anderzijds", "in tegenstelling tot", "daar staat tegenover", "daarentegen", "desondanks", "echter", "hoewel", "integendeel", "maar", "niettemin", "desalniettemin", "ondanks", "toch", "weliswaar ... maar"] },
  { id: "voorwaarde", label: "voorwaarde", uitleg: "Iets gebeurt alleen in het geval dat iets anders eerst klopt.", woorden: ["op voorwaarde dat", "als", "indien", "mits", "tenzij"] },
  { id: "samenvatting", label: "samenvatting / herhaling", uitleg: "Het belangrijkste wordt nog een keer kort gezegd.", woorden: ["al met al", "met andere woorden", "het komt erop neer dat", "kortom", "ofwel / oftewel", "samengevat", "terugblikkend", "zoals gezegd"] },
  { id: "conclusie", label: "conclusie", uitleg: "Uit wat ervoor staat, volgt een eindoordeel.", woorden: ["concluderend", "dus", "hieruit volgt", "uit dit alles blijkt", "vandaar dat"] }
];

// Verbanden die erg op elkaar lijken: deze worden nooit als fout antwoord naast elkaar gezet.
window.VERBANDEN_BUREN = [
  ["oorzaak", "reden"],
  ["samenvatting", "conclusie"]
];

// Woorden die zonder zin geen eenduidig verband hebben. Deze komen niet voor bij 'Losse woorden'
// (wel in de zinnen, zie data/zinnen.js).
window.LOS_UITGESLOTEN = ["met", "zo", "en", "door", "als", "ook", "vervolgens", "ten slotte", "want"];

// Korte omschrijving per signaalwoord (hint via het ?-knopje of na 10 seconden).
// Let op: de naam van het verband zelf staat er bewust niet in.
window.SIGNAAL_UITLEG = {
  // tijd
  "vroeger": "lang geleden, in het verleden",
  "voordat": "eerder dan iets anders gebeurt",
  "eerst": "als allereerste, vóór de rest",
  "zodra": "meteen op het moment dat",
  "intussen": "ondertussen, op hetzelfde moment",
  "tijdens": "zolang iets bezig is",
  "terwijl": "op hetzelfde moment dat",
  "daarna": "later, na dat moment",
  "nadat": "toen iets al gebeurd was",
  "vervolgens": "daarna, als volgende stap",
  "ten slotte": "als allerlaatste",
  "wanneer": "op het moment dat",
  // oorzaak-gevolg
  "als gevolg van": "omdat dat eerst gebeurde, gebeurt nu dit",
  "daardoor": "door wat net genoemd is, gebeurt dit",
  "vanwege": "door iets dat er is of gebeurde",
  "dat komt door": "zo vertel je waardoor iets gebeurd is",
  "door": "het ene zorgt voor het andere",
  "doordat": "omdat dit gebeurde, gebeurde dat",
  "wegens": "door, vanwege",
  "ten gevolge van": "door, als uitkomst van iets",
  "waardoor": "en daarom gebeurde er iets anders",
  "want": "nu volgt waarom of waardoor",
  // overeenkomst / vergelijking
  "evenals": "net zoals, op dezelfde manier als",
  "evenzeer": "net zo veel, in dezelfde mate",
  "hetzelfde als": "gelijk aan",
  "is vergelijkbaar met": "lijkt veel op",
  "lijkt op": "is bijna hetzelfde als",
  "net als": "op dezelfde manier als",
  "zie ook": "kijk ook naar iets wat erop lijkt",
  // doel-middel
  "daarmee": "met dat ding, of op die manier",
  "daartoe": "om dat te bereiken",
  "door middel van": "met behulp van",
  "met": "met behulp van, door iets te gebruiken",
  "met de bedoeling": "omdat je dat wilt bereiken",
  "om te": "zodat je iets kunt bereiken",
  // reden / verklaring / argument
  "aangezien": "omdat, nu het zo is dat",
  "daarom": "en dat is waarom",
  "immers": "je weet toch dat… (de uitleg volgt)",
  "namelijk": "hier komt de uitleg waarom",
  "om die reden": "daarom",
  "omdat": "hier volgt waarom",
  "op grond van": "omdat je dat weet of gezien hebt",
  // toelichting / voorbeeld
  "bijvoorbeeld": "nu komt een geval om het duidelijk te maken",
  "dat wil zeggen": "anders gezegd, om het uit te leggen",
  "een voorbeeld": "nu volgt iets om het duidelijk te maken",
  "je moet daarbij denken aan": "dit bedoel ik ermee",
  "onder andere": "een paar dingen uit een groter rijtje",
  "denk aan": "noem iets om het duidelijk te maken",
  "stel je voor": "beeld je in, denk je eens in",
  "zo": "op deze manier, kijk maar",
  "zoals": "net als, kijk maar naar",
  // opsomming
  "ten eerste, ten tweede": "je noemt dingen één voor één op",
  "in de eerste plaats": "als eerste punt",
  "om te beginnen": "het eerste punt is",
  "niet alleen ... maar ook": "het ene én het andere",
  "een andere reden": "er komt nog een punt bij",
  "ook": "er komt nog iets bij",
  "bovendien": "en daar komt nog bij",
  "daarnaast": "naast dit is er nog iets",
  "en": "plus nog iets",
  "verder": "en nog meer",
  "als laatste": "het laatste punt",
  // tegenstelling
  "aan de ene kant, aan de andere kant": "je bekijkt twee kanten die anders zijn",
  "enerzijds ... anderzijds": "je bekijkt twee kanten die anders zijn",
  "in tegenstelling tot": "heel anders dan",
  "daar staat tegenover": "maar er is ook een andere kant",
  "daarentegen": "juist anders, het omgekeerde",
  "desondanks": "ook al is dat zo, toch…",
  "echter": "maar",
  "hoewel": "ook al",
  "integendeel": "juist het omgekeerde",
  "maar": "wat volgt is anders dan je verwacht",
  "niettemin": "toch, ook al is dat zo",
  "desalniettemin": "toch, ook al is dat zo",
  "ondanks": "ook al is iets zo",
  "toch": "terwijl je het niet zou verwachten",
  "weliswaar ... maar": "het is wel zo, maar…",
  // voorwaarde
  "op voorwaarde dat": "alleen als dat eerst klopt",
  "als": "in het geval dat",
  "indien": "als, in het geval dat",
  "mits": "alleen als",
  "tenzij": "behalve als, niet als",
  // samenvatting / herhaling
  "al met al": "als je alles bij elkaar neemt",
  "met andere woorden": "nog een keer, maar anders gezegd",
  "het komt erop neer dat": "in het kort is het zo",
  "kortom": "in het kort",
  "ofwel / oftewel": "anders gezegd",
  "samengevat": "alles kort op een rijtje",
  "terugblikkend": "als je terugkijkt op wat er was",
  "zoals gezegd": "dat is eerder al verteld",
  // conclusie
  "concluderend": "wat je eruit kunt opmaken, is",
  "dus": "uit wat ervoor staat volgt",
  "hieruit volgt": "hieruit kun je opmaken",
  "uit dit alles blijkt": "als je alles bekijkt, weet je nu",
  "vandaar dat": "en zo komt het dat"
};
