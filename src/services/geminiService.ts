import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Payslip, HistoricalAnalysisResult } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const MUNICIPAL_TAX_TABLES_TEXT = `
Diffusione Limitata
Elenco aggiornato al 12 febbraio 2025
Codice catastale,Comune,Provincia,Aliquota unica,Aliquota1,Aliquota2,Aliquota3,Aliquota4,Aliquota5,Aliquota6,Aliquota7,Aliquota8,Aliquota9,Aliquota 10,Aliquota11,Aliquota12,Esenzione,Casi specifici
A001,ABANO TERME,PD,0.8,,,,,,,,,,,12.000,00,
A004,ABBADIA CERRETO,LO,0.7,,,,,,,,,,,10.000,00,
A005,ABBADIA LARIANA,LC,,0.75,0.76,0.77,0.8,,,,,,,,,15.000,00,
A006,ABBADIA SAN SALVATORE,SI,0.6,,,,,,,,,,,12.000,00,
A007,ABBASANTA,OR,0.25,,,,,,,,,,,15.000.00,
A008,ABBATEGGIO,PE,0.5,,,,,,,,,,,,,,
A010,ABBIATEGRASSO,MI,0.8,,,,,,,,,,,13.000,00,
A013,ABRIOLA,PZ,0,,,,,,,,,,,,,,
A014,ACATE,RG,0.8,,,,,,,,,,,,,,
A015,ACCADIA,FG,0.8,,,,,,,,,,,,,,
A016,ACCEGLIO,CN,0,,,,,,,,,,,,,,
A017,ACCETTURA,MT,0.7,,,,,,,,,,,,,,
A018,ACCIANO,AQ,0.2,,,,,,,,,,,,,,
A019,ACCUMOLI,RI,0.5,,,,,,,,,,,,,,
A020,ACERENZA,PZ,0.8,,,,,,,,,,,,,,
A022,CERMES,BZ,0*,,,,,,,,,,,,,,
A023,ACERNO,SA,0.8,,,,,,,,,,,,,,
A024,ACERRA,NA,0.8,,,,,,,,,,,7.500,00,NOTA
A025,ACI BONACCORSI,CT,0.7,,,,,,,,,,,7.500,00,
A026,ACI CASTELLO,CT,0.8,,,,,,,,,,,,,,
A027,ACI CATENA,CT,0.8,,,,,,,,,,,,,,
A028,ACIREALE,CT,0.8,,,,,,,,,,,,,,
A029,ACI SANT'ANTONIO,CT,0.8,,,,,,,,,,,,,,
A032,ACQUAFONDATA,FR,0.5,,,,,,,,,,,9.999.99,
A033,ACQUAFORMOSA,CS,0.8,,,,,,,,,,,,,,
A034,ACQUAFREDDA,BS,,0.38,0.4,0.45,0.47,,,,,,,,,
A035,ACQUALAGNA,PU,0.8,,,,,,,,,,,,,,
A038,ACQUANEGRA SUL CHIESE,MN,,0.55,0.68,0.72,0.8,,,,,,,,,10.000,00,
A039,ACQUANEGRA CREMONESE,CR,0.8,,,,,,,,,,,,,,
A040,ACQUAPENDENTE,VT,0.7,,,,,,,,,,,,,,
A041,ACQUAPPESA,CS,0.8,,,,,,,,,,,,,,
A043,ACQUARO,W,0.8,,,,,,,,,,,,,,
A044,ACQUASANTA TERME,AP,0.8,,,,,,,,,,,,,,
A045,ACQUASPARTA,TR,0.8,,,,,,,,,,,,,,
A047,ACQUAVIVA PICENA,AP,0.8,,,,,,,,,,,,,,
A048,ACQUAVIVA DELLE FONTI,BA,,0.4,0.6,0.8,,,,,,,,,,9.000,00,
A049,ACQUAVIVA PLATANI,CL,0*,,,,,,,,,,,,,,
A050,ACQUAVIVA COLLECROCE,CB,0.2,,,,,,,,,,,,,,
A051,ACQUAVIVA D'ISERNIA,IS,0*,,,,,,,,,,,,,,
A052,ACQUI TERME,AL,0.8,,,,,,,,,,,,,,
A053,ACRI,CS,0.8,,,,,,,,,,,,,,
A054,ACUTO,FR,0.8,,,,,,,,,,,13.000.00,
A055,ADELFIA,BA,0.7,,,,,,,,,,,,,,
A056,ADRANO,CT,0.8,,,,,,,,,,,,,,
A057,ADRARA SAN MARTINO,BG,0.8,,,,,,,,,,,15.000,00,
A058,ADRARA SAN ROCCO,BG,0.8,,,,,,,,,,,,,,
A059,ADRIA,RO,0.8,,,,,,,,,,,9.999,99,
A060,ADRO,BS,0.5,,,,,,,,,,,10.000,00,
A061,AFFI,VR,,0.3,0.5,0.8,,,,,,,,,,
A062,AFFILE,RM,0.8,,,,,,,,,,,,,,
A064,AFRAGOLA,NA,0.8,,,,,,,,,,,7.999,99,
A065,AFRICO,RC,0.8,,,,,,,,,,,10.000.00,
A067,AGAZZANO,PC,0.8,,,,,,,,,,,9.000,00,
A068,AGEROLA,NA,0.7,,,,,,,,,,,15.000,00,
A069,AGGIUS,SS,0.2,,,,,,,,,,,,,,
A070,AGIRA,EN,0.8,,,,,,,,,,,,,,
A071,AGLIANA,PT,0.8,,,,,,,,,,,,,,
A072,AGLIANO TERME,AT,0.7,,,,,,,,,,,,,,
A074,AGLIE,TO,0.8,,,,,,,,,,,13.499.99,
A075,AGNA,PD,0.78,,,,,,,,,,,,,,
A076,AGNADELLO,CR,0.7,,,,,,,,,,,,,,
A077,AGNANA CALABRA,RC,0.8,,,,,,,,,,,,,,
A080,AGNONE,IS,0.6,,,,,,,,,,,,,,
A081,VILLA LATINA,FR,0.8,,,,,,,,,,,,,,
A082,AGNOSINE,BS,0.5,,,,,,,,,,,,,,
A083,AGORDO,BL,,0.63,0.76,0.79,0.8,,,,,,,,,10.000,00,
A084,AGOSTA,RM,0.6,,,,,,,,,,,16.000,00,
A085,AGRA,VA,0.3,,,,,,,,,,,15.000.00,
A087,AGRATE BRIANZA,MB,0.8,,,,,,,,,,,15.000,00,
A088,AGRATE CONTURBIA,NO,,0.4,0.65,0.8,0.8,,,,,,,,,10.000,00,
A089,AGRIGENTO,AG,0.8,,,,,,,,,,,7.499,99,
A091,AGROPOLI,SA,0.8,,,,,,,,,,,7.500.00,
A092,AGUGLIANO,AN,0.8,,,,,,,,,,,,,,
A093,AGUGLIARO,VI,,0.5,0.55,0.6,,,,,,,,,,,10.000,00,
A094,AYAS,AO,0*,,,,,,,,,,,,,,
A096,AICURZIO,MB,0.8,,,,,,,,,,,,,,
A097,AIDOMAGGIORE,OR,0*,,,,,,,,,,,,,,
A098,AIDONE,EN,0.8,,,,,,,,,,,,,,
A100,AIELLI,AQ,0.2,,,,,,,,,,,,,,
A101,AIELLO DEL SABATO,AV,0.8,,,,,,,,,,,,,,
A102,AIELLO CALABRO,CS,0.5,,,,,,,,,,,,,,
A103,AIELLO DEL FRIULI,UD,,0.2,0.35,0.45,0.65,,,,,,,,,15.000,00,
A105,AIETA,CS,,0.4,0.6,0.65,0.8,,,,,,,,,9.500,00,
A106,AILANO,CE,0.8,,,,,,,,,,,,,,
A107,AILOCHE,BI,0.6,,,,,,,,,,,,,,
A108,AYMAVILLES,AO,0.15,,,,,,,,,,,18.000,00,
A109,AIRASCA,TO,0.6,,,,,,,,,,,10.000,00,
A110,AIROLA,BN,0.8,,,,,,,,,,,,,,
A111,AIROLE,IM,0.8,,,,,,,,,,,10.000,00,
A112,AIRUNO,LC,,0.33,0.35,0.8,,,,,,,,,,,
A113,AISONE,CN,0,,,,,,,,,,,,,,
A115,ALA' DEI SARDI,SS,0*,,,,,,,,,,,,,,
A116,ALA,TN,0,,,,,,,,,,,,,,
A117,ALA DI STURA,TO,0*,,,,,,,,,,,,,,
A118,ALAGNA,PV,0.65,,,,,,,,,,,,,,
A119,ALAGNA VALSESIA,VC,0.3,,,,,,,,,,,,,,
A120,ALANNO,PE,0.8,,,,,,,,,,,,,,
A122,ALASSIO,SV,0.8,,,,,,,,,,,12.000.00,
A123,ALATRI,FR,0.8,,,,,,,,,,,15.000,00,
A124,ALBA,CN,,0.4,0.45,0.5,0.6,,,,,,,,,8.500,00,
A125,ALBA ADRIATICA,TE,0.8,,,,,,,,,,,8.000.00,
A126,ALBAGIARA,OR,0*,,,,,,,,,,,,,,
A127,ALBAIRATE,MI,0.8,,,,,,,,,,,10.000,00,
A128,ALBANELLA,SA,0.8,,,,,,,,,,,9.999,99,
A129,ALBANO SANT'ALESSANDRO,BG,,0.65,0.73,0.78,0.8,,,,,,,,,8.000,00,
A130,ALBANO VERCELLESE,VC,0.5,,,,,,,,,,,,,,
A131,ALBANO DI LUCANIA,PZ,0.8,,,,,,,,,,,,,,
A132,ALBANO LAZIALE,RM,0.8,,,,,,,,,,,,,,
A135,ALBAREDO PER SAN MARCO,SO,0*,,,,,,,,,,,,,,
A137,ALBAREDO D'ADIGE,VR,0.8,,,,,,,,,,,,,,
A138,ALBARETO,PR,0.8,,,,,,,,,,,,,,
A139,ALBARETTO DELLA TORRE,CN,,0.5,0.65,0.69,0.7,,,,,,,,,
A143,ALBAVILLA,CO,0.8,,,,,,,,,,,13.000,00,
A145,ALBENGA,SV,,0.65,0.68,0.73,0.8,,,,,,,,,
A146,ALBERA LIGURE,AL,0.45,,,,,,,,,,,,,,
A149,ALBEROBELLO,BA,,0.6,0.7,0.78,0.8,,,,,,,,,7.500.00,
A150,ALBERONA,FG,0,,,,,,,,,,,,,,
A153,ALBESE CON CASSANO,CO,0.5,,,,,,,,,,,,,,
A154,ALBETTONE,VI,0.5,,,,,,,,,,,15.000,00,
A155,ALBI,CZ,0.6,,,,,,,,,,,,,,
A157,ALBIANO D'IVREA,TO,,0.54,0.61,0.68,0.75,,,,,,,,,
A158,ALBIANO,TN,0*,,,,,,,,,,,,,,
A159,ALBIATE,MB,0.8,,,,,,,,,,,,,,
A160,ALBIDONA,CS,0.2,,,,,,,,,,,,,,
A161,ALBIGNASEGO,PD,0.8,,,,,,,,,,,12.670,00,
A162,ALBINEA,RE,,0.55,0.55,0.7,0.8,,,,,,,,,10.000,00,
A163,ALBINO,BG,,0.58,0.74,0.78,0.8,,,,,,,,,
A164,ALBIOLO,CO,,0.45,0.5,0.6,,,,,,,,,,,15.000,00,
A165,ALBISSOLA MARINA,SV,0.8,,,,,,,,,,,10.000,00,
A166,ALBISOLA SUPERIORE,SV,0.8,,,,,,,,,,,,,,
A167,ALBIZZATE,VA,0.8,,,,,,,,,,,,,,
A171,ALBONESE,PV,0*,,,,,,,,,,,,,,
A172,ALBOSAGGIA,SO,0*,,,,,,,,,,,,,,
A173,ALBUGNANO,AT,0.4,,,,,,,,,,,,,,
A175,ALBUZZANO,PV,0.8,,,,,,,,,,,10.999,99,
A176,ALCAMO,TP,0.8,,,,,,,,,,,7.499,99,
A177,ALCARA LI FUSI,ME,0.6,,,,,,,,,,,,,,
A178,ALDENO,TN,0*,,,,,,,,,,,,,,
A179,ALDINO,BZ,0*,,,,,,,,,,,,,,
A180,ALES,OR,0*,,,,,,,,,,,,,,
A181,ALESSANDRIA DELLA ROCCA,AG,,0.2,0.3,0.4,0.6,,,,,,,,,,7.500,00,
A182,ALESSANDRIA,AL,,0.8,0.8,1.2,,,,,,,,,,,
A183,ALESSANDRIA DEL CARRETTO,CS,0.3,,,,,,,,,,,,,,
A184,ALESSANO,LE,0.8,,,,,,,,,,,,,,
A185,ALEZIO,LE,0.8,,,,,,,,,,,,,,
A186,ALFANO,SA,0.3,,,,,,,,,,,,,,
A187,ALFEDENA,AQ,0.4,,,,,,,,,,,,,,
A188,ALFIANELLO,BS,0.2,,,,,,,,,,,,,,
A189,ALFIANO NATTA,AL,0.5,,,,,,,,,,,,,,
A191,ALFONSINE,RA,,0.7,0.73,0.77,0.8,,,,,,,,,
A192,ALGHERO,SS,0.8,,,,,,,,,,,,,,
A193,ALGUA,BG,0.8,,,,,,,,,,,,,,
A194,ALI',ME,0.8,,,,,,,,,,,8.000,00,
A195,ALIA,PA,0.8,,,,,,,,,,,,,,
A196,ALIANO,MT,0.8,,,,,,,,,,,,,,
A197,ALICE BEL COLLE,AL,0.5,,,,,,,,,,,,,,
A198,ALICE CASTELLO,VC,0.6,,,,,,,,,,,9.999,99,
A200,ALIFE,CE,0.8,,,,,,,,,,,,,,
A201,ALI' TERME,ME,0.8,,,,,,,,,,,,,,
A202,ALIMENA,PA,0.5,,,,,,,,,,,,,,
A203,ALIMINUSA,PA,0.8,,,,,,,,,,,,,,
A204,ALLAI,OR,0*,,,,,,,,,,,,,,
A205,ALLEIN,AO,0*,,,,,,,,,,,,,,
A206,ALLEGHE,BL,0.8,,,,,,,,,,,,,,
A207,ALLERONA,TR,0.8,,,,,,,,,,,,,,
A208,ALLISTE,LE,0.8,,,,,,,,,,,8.500,00,
A210,ALLUMIERE,RM,0.8,,,,,,,,,,,13.000,00,
A214,ALME,BG,,0.74,0.78,0.8,,,,,,,,,,,
A215,VILLA D'ALME',BG,,0.74,0.78,0.8,,,,,,,,,,,
A216,ALMENNO SAN BARTOLOMEO,BG,0.8,,,,,,,,,,,,,,
A217,ALMENNO SAN SALVATORE,BG,0.7,,,,,,,,,,,,,,
A218,ALMESE,TO,0.7,,,,,,,,,,,,,,
A220,ALONTE,VI,0.8,,,,,,,,,,,50.000,00,
A221,ALPETTE,TO,0.1,,,,,,,,,,,,,,
A222,ALPIGNANO,TO,,0.55,0.65,0.75,0.8,,,,,,,,,12.000.00,
A223,ALSENO,PC,,0.74,0.76,0.78,0.8,,,,,,,,,9.999,99,
A224,ALSERIO,CO,0.8,,,,,,,,,,,9.999,99,
A225,ALTAMURA,BA,0.8,,,,,,,,,,,,,,
A226,ALTARE,SV,0.7,,,,,,,,,,,,,,
A227,ALTAVILLA MONFERRATO,AL,0.6,,,,,,,,,,,,,,
A228,ALTAVILLA IRPINA,AV,,0.55,0.6,0.7,0.8,,,,,,,,,6.000,00,
A229,ALTAVILLA MILICIA,PA,0.8,,,,,,,,,,,,,,
A230,ALTAVILLA SILENTINA,SA,0.8,,,,,,,,,,,,,,
A231,ALTAVILLA VICENTINA,VI,0.8,,,,,,,,,,,12.000,00,
A233,ALTIDONA,FM,0.8,,,,,,,,,,,7.999,99,
A234,ALTILIA,CS,0.8,,,,,,,,,,,,,,
A235,ALTINO,CH,0.8,,,,,,,,,,,7.999,99,
A236,ALTISSIMO,VI,0.8,,,,,,,,,,,,,,
A237,ALTIVOLE,TV,0.4,,,,,,,,,,,10.000,00,
A238,ALTO,CN,0.8,,,,,,,,,,,,,,
A239,ALTOFONTE,PA,0.8,,,,,,,,,,,7.499.99,
A240,ALTOMONTE,CS,0.5,,,,,,,,,,,15.000,00,NOTA
A241,ALTOPASCIO,LU,0.8,,,,,,,,,,,,,,
A242,ALVIANO,TR,0.6,,,,,,,,,,,,,,
A243,ALVIGNANO,CE,0.8,,,,,,,,,,,,,,
A244,ALVITO,FR,0.8,,,,,,,,,,,,,,
A245,ALZANO SCRIVIA,AL,0.8,,,,,,,,,,,,,,
A246,ALZANO LOMBARDO,BG,0.8,,,,,,,,,,,14.999,99,
A249,ALZATE BRIANZA,CO,0.8,,,,,,,,,,,5.999,99,
A251,AMALFI,SA,0.7,,,,,,,,,,,15.000,00,
A252,AMANDOLA,FM,0.7,,,,,,,,,,,,,,
A253,AMANTEA,CS,0.8,,,,,,,,,,,,,,
A254,AMARO,UD,0*,,,,,,,,,,,,,,
A255,AMARONI,CZ,0.4,,,,,,,,,,,,,,
A256,AMASENO,FR,0.8,,,,,,,,,,,,,,
A257,AMATO,CZ,0.8,,,,,,,,,,,,,,
A258,AMATRICE,RI,0.8,,,,,,,,,,,10.000,00,
A259,AMBIVERE,BG,0.8,,,,,,,,,,,10.000.00,
A261,AMEGLIA,SP,,0.6,0.65,0.7,0.75,,,,,,,,,10.000,00,
A262,AMELIA,TR,0.8,,,,,,,,,,,11.000,00,
A263,AMENDOLARA,CS,0.8,,,,,,,,,,,,,,
A264,AMENO,NO,0.2,,,,,,,,,,,12.000.00,
A265,AMOROSI,BN,0.8,,,,,,,,,,,,,,
A266,CORTINA D'AMPEZZO,BL,0*,,,,,,,,,,,,,,
A267,AMPEZZO,UD,0.4,,,,,,,,,,,,,,
A268,ANACAPRI,NA,,0.4,0.41,0.6,0.79,,,,,,,,,
A269,ANAGNI,FR,0.8,,,,,,,,,,,,,,
A270,ANCARANO,TE,0.6,,,,,,,,,,,,,,
A271,ANCONA,AN,0.8,,,,,,,,,,,,,,
A272,ANDALI,CZ,0*,,,,,,,,,,,,,,
A273,ANDALO VALTELLINO,SO,0*,,,,,,,,,,,,,,
A274,ANDALO,TN,0*,,,,,,,,,,,,,,
A275,ANDEZENO,TO,0.75,,,,,,,,,,,,,,
A278,ANDORA,SV,0*,,,,,,,,,,,,,,
A280,ANDORNO MICCA,BI,0.8,,,,,,,,,,,,,,
A281,ANDRANO,LE,0.8,,,,,,,,,,,,,,
A282,ANDRATE,TO,0.8,,,,,,,,,,,,,,
A283,ANDREIS,PN,0*,,,,,,,,,,,,,,
A284,ANDRETTA,AV,0.8,,,,,,,,,,,,,,
A285,ANDRIA,BT,0.8,,,,,,,,,,,7.500.00,
A286,ANDRIANO,BZ,0*,,,,,,,,,,,,,,
A287,ANELA,SS,0*,,,,,,,,,,,,,,
A288,ANFO,BS,0.7,,,,,,,,,,,,,,
A290,ANGERA,VA,0.7,,,,,,,,,,,10.000,00,
A291,ANGHIARI,AR,0.8,,,,,,,,,,,10.499,99,
A292,ANGIARI,VR,0.8,,,,,,,,,,,,,,
A293,ANGOLO TERME,BS,0.6,,,,,,,,,,,10.000,00,
A294,ANGRI,SA,0.6,,,,,,,,,,,12.000,00,
A295,ANGROGNA,TO,0.65,,,,,,,,,,,12.000,00,
A296,ANGUILLARA VENETA,PD,0.79,,,,,,,,,,,10.000,00,
A297,ANGUILLARA SABAZIA,RM,0.8,,,,,,,,,,,,,,
A299,ANNICCO,CR,0.8,,,,,,,,,,,,,,
A300,CASTELLO DI ANNONE,AT,0.2,,,,,,,,,,,,,,
A301,ANNONE DI BRIANZA,LC,,0.5,0.55,0.6,0.65,,,,,,,,,15.000,00,
A302,ANNONE VENETO,VE,0.8,,,,,,,,,,,10.000.00,
A303,ANOIA,RC,0.8,,,,,,,,,,,,,,
A304,ANTEGNATE,BG,0.8,,,,,,,,,,,10.000,00,
A305,ANTEY-SAINT-ANDRE',AO,0*,,,,,,,,,,,,,,
A306,ANTERIVO,BZ,0*,,,,,,,,,,,,,,
A308,LA MAGDELEINE,AO,0*,,,,,,,,,,,,,,
A309,ANTICOLI CORRADO,RM,0.2,,,,,,,,,,,,,,
A310,FIUGGI,FR,,0.7,0.7,0.8,,,,,,,,,,,15.000,00,
A312,ANTIGNANO,AT,0.6,,,,,,,,,,,,,,
A313,ANTILLO,ME,0.8,,,,,,,,,,,,,,
A314,ANTONIMINA,RC,0.4,,,,,,,,,,,,,,
A315,ANTRODOCO,RI,0.8,,,,,,,,,,,,,,
A317,ANTRONA SCHIERANCO,VB,0*,,,,,,,,,,,,,,
A318,ANVERSA DEGLI ABRUZZI,AQ,0.6,,,,,,,,,,,,,,
A319,ANZANO DEL PARCO,CO,,0.4,0.4,0.4,0.6,,,,,,,,,15.000,00,
A320,ANZANO DI PUGLIA,FG,,0.6,0.65,0.75,0.8,,,,,,,,,
A321,ANZI,PZ,0.4,,,,,,,,,,,,,,
A323,ANZIO,RM,0.8,,,,,,,,,,,12.000,00,
A324,ANZOLA DELL'EMILIA,BO,0.8,,,,,,,,,,,13.000,00,
A325,ANZOLA D'OSSOLA,VB,,0.45,0.55,0.65,0.8,,,,,,,,,10.000,00,
A326,AOSTA,AO,0.5,,,,,,,,,,,9.999,99,
A327,APECCHIO,PU,0.7,,,,,,,,,,,,,,
A328,APICE,BN,0.8,,,,,,,,,,,,,,
A329,APIRO,MC,0.8,,,,,,,,,,,,,,
A330,APOLLOSA,BN,0.4,,,,,,,,,,,,,,
A332,APPIANO SULLA STRADA DEL VINO,BZ,,0.15,0.35,0.55,0.8,,,,,,,,,25.000,00,
A333,APPIANO GENTILE,CO,,0.27,0.6,0.8,,,,,,,,,,,
A334,APPIGNANO,MC,0.65,,,,,,,,,,,,,,
A335,APPIGNANO DEL TRONTO,AP,0.8,,,,,,,,,,,,,,
A337,APRICA,SO,0.8,,,,,,,,,,,9.000,00,
A338,APRICALE,IM,0.8,,,,,,,,,,,,,,
A339,APRICENA,FG,0.7,,,,,,,,,,,,,,
A340,APRIGLIANO,CS,0.5,,,,,,,,,,,,,,
A341,APRILIA,LT,0.8,,,,,,,,,,,8.500,00,
A343,AQUARA,SA,0.8,,,,,,,,,,,,,,
A344,AQUILA D'ARROSCIA,IM,0.8,,,,,,,,,,,,,,
A345,L'AQUILA,AQ,0.6,,,,,,,,,,,15.000,00,
A346,AQUILEIA,UD,,0.3,0.4,0.6,0.78,,,,,,,,,,15.000,00,
A347,AQUILONIA,AV,0*,,,,,,,,,,,,,,
A348,AQUINO,FR,0.8,,,,,,,,,,,8.000,00,
A350,ARADEO,LE,0.8,,,,,,,,,,,,,,
A351,ARAGONA,AG,0.8,,,,,,,,,,,,,,
A352,ARAMENGO,AT,0.8,,,,,,,,,,,,,,
A354,ARBA,PN,0.5,,,,,,,,,,,10.000,00,
A355,TORTOLI',NU,0.8,,,,,,,,,,,,,,
A357,ARBOREA,OR,,0.2,0.4,0.55,0.75,,,,,,,,,10.000,00,
A358,ARBORIO,VC,0.8,,,,,,,,,,,,,,
A359,ARBUS,SU,0.1,,,,,,,,,,,,,,
A360,ARCADE,TV,,0.6,0.65,0.7,0.75,,,,,,,,,10.000,00,
A363,ARCE,FR,0.8,,,,,,,,,,,6.500,00,
A365,ARCENE,BG,,0.65,0.68,0.72,0.8,,,,,,,,,7.500,00,
A366,ARCEVIA,AN,0.8,,,,,,,,,,,,,,
A367,ARCHI,CH,0.8,,,,,,,,,,,,,,
A368,SAN NICOLO' D'ARCIDANO,OR,0.3,,,,,,,,,,,10.000.00,
A369,ARCIDOSSO,GR,0.6,,,,,,,,,,,,,,
A370,ARCINAZZO ROMANO,RM,0.6,,,,,,,,,,,,,,
A371,ARCISATE,VA,0.6,,,,,,,,,,,10.000,00,
A372,ARCO,TN,0*,,,,,,,,,,,,,,
A373,ARCOLA,SP,0.8,,,,,,,,,,,12.000,00,
A374,ARCOLE,VR,,0.45,0.5,0.6,0.8,,,,,,,,,
A375,ARCONATE,MI,0.8,,,,,,,,,,,10.000,00,
A376,ARCORE,MB,0.8,,,,,,,,,,,14.999,99,
A377,ARCUGNANO,VI,,0.7,0.77,0.78,0.8,,,,,,,,,10.000,00,
A379,ARDARA,SS,0*,,,,,,,,,,,,,,
A380,ARDAULI,OR,0*,,,,,,,,,,,,,,
A382,ARDENNO,SO,0*,,,,,,,,,,,,,,
A383,ARDESIO,BG,0.8,,,,,,,,,,,,,,
A385,ARDORE,RC,0.7,,,,,,,,,,,7.499,99,
A386,ARENA,W,,0.4,0.5,0.6,0.7,,,,,,,,,5.500,00,
A387,ARENA PO,PV,0.5,,,,,,,,,,,10.500,00,
A388,ARENZANO,GE,0.2,,,,,,,,,,,,,,
A389,ARESE,MI,,0.48,0.5,0.79,0.8,,,,,,,,,16.999,99,
A390,AREZZO,AR,,0.48,0.49,0.78,0.79,,,,,,,,,,13.500,00,
A391,ARGEGNO,CO,0.6,,,,,,,,,,,10.000,00,
A392,ARGELATO,BO,0.8,,,,,,,,,,,,,,
A393,ARGENTA,FE,0.8,,,,,,,,,,,7.999.99,
A394,ARGENTERA,CN,0.8,,,,,,,,,,,,,,
A396,ARGUELLO,CN,0.8,,,,,,,,,,,,,,
A397,ARGUSTO,CZ,0*,,,,,,,,,,,,,,
A398,ARI,CH,0.8,,,,,,,,,,,,,,
A399,ARIANO IRPINO,AV,0.8,,,,,,,,,,,,,,
A400,ARIANO NEL POLESINE,RO,0.7,,,,,,,,,,,,,,
A401,ARICCIA,RM,0.8,,,,,,,,,,,12.000,00,
A402,ARIELLI,CH,0,,,,,,,,,,,,,,
A403,ARIENZO,CE,0.8,,,,,,,,,,,,,,
A405,ARIGNANO,TO,0.5,,,,,,,,,,,,,,
A407,ARITZO,NU,0.2,,,,,,,,,,,,,,
A409,ARIZZANO,VB,0.5,,,,,,,,,,,,,,
A412,ARLENA DI CASTRO,VT,0.7,,,,,,,,,,,,,,
A413,ARLUNO,MI,0.8,,,,,,,,,,,,,,
A414,ARMENO,NO,0.2,,,,,,,,,,,,,,
A415,ARMENTO,PZ,0*,,,,,,,,,,,,,,
A418,ARMO,IM,0.8,,,,,,,,,,,,,,
A419,ARMUNGIA,SU,0*,,,,,,,,,,,,,,
A421,ARNARA,FR,0.6,,,,,,,,,,,,,,
A422,ARNASCO,SV,0.8,,,,,,,,,,,,,,
A424,ARNAD,AO,0*,,,,,,,,,,,,,,
A425,ARNESANO,LE,0.45,,,,,,,,,,,10.000.00,
A427,AROLA,VB,0.4,,,,,,,,,,,,,,
A429,ARONA,NO,0.8,,,,,,,,,,,12.500,00,
A430,AROSIO,CO,0.8,,,,,,,,,,,,,,
A431,ARPAIA,BN,0.8,,,,,,,,,,,,,,
A432,ARPAISE,BN,0.5,,,,,,,,,,,,,,
A433,ARPINO,FR,0.8,,,,,,,,,,,,,,
A434,ARQUA' PETRARCA,PD,,0.65,0.72,0.74,,,,,,,,,,,10.000,00,
A435,ARQUA' POLESINE,RO,0.7,,,,,,,,,,,9.999,99,
A436,ARQUATA SCRIVIA,AL,,0.76,0.77,0.8,,,,,,,,,,,10.000,00,
A437,ARQUATA DEL TRONTO,AP,0.6,,,,,,,,,,,8.000,00,
A438,ARRE,PD,0.8,,,,,,,,,,,,,,
A439,ARRONE,TR,0.8,,,,,,,,,,,12.000,00,
A440,ARZAGO D'ADDA,BG,0.8,,,,,,,,,,,10.000,00,
A441,ARSAGO SEPRIO,VA,0.8,,,,,,,,,,,12.000,00,
A443,ARSIE,BL,0.8,,,,,,,,,,,,,,
A444,ARSIERO,VI,,0.73,0.76,0.78,0.8,,,,,,,,,15.000,00,
A445,ARSITA,TE,0.6,,,,,,,,,,,,,,
A446,ARSOLI,RM,0.6,,,,,,,,,,,,,,
A447,ARTA TERME,UD,0.6,,,,,,,,,,,,,,
A448,ARTEGNA,UD,0.5,,,,,,,,,,,,,,
A449,ARTENA,RM,0.8,,,,,,,,,,,,,,
A451,ARTOGNE,BS,0.8,,,,,,,,,,,,,,
A452,ARVIER,AO,0*,,,,,,,,,,,,,,
A453,ARZACHENA,SS,0*,,,,,,,,,,,,,,
A454,ARZANA,NU,0*,,,,,,,,,,,,,,
A455,ARZANO,NA,0.8,,,,,,,,,,,6.000.00,
A458,ARZERGRANDE,PD,0.8,,,,,,,,,,,,,,
A459,ARZIGNANO,VI,0.8,,,,,,,,,,,,,,
A460,ASCEA,SA,0.8,,,,,,,,,,,,,,
A461,ASCIANO,SI,,0.7,0.72,0.75,0.78,,,,,,,,,,8.500,00,
A462,ASCOLI PICENO,AP,0.8,,,,,,,,,,,8.500,00,
A463,ASCOLI SATRIANO,FG,0.8,,,,,,,,,,,,,,
A464,ASCREA,RI,0.7,,,,,,,,,,,,,,
A465,ASIAGO,VI,0.8,,,,,,,,,,,,,,
A466,ASIGLIANO VERCELLESE,VC,0.48,,,,,,,,,,,,,,
A467,ASIGLIANO VENETO,VI,0.3,,,,,,,,,,,15.000,00,
A468,SINALUNGA,SI,,0.75,0.79,0.8,0.8,,,,,,,,,NOTA
A470,ASOLA,MN,,0.65,0.79,0.8,,,,,,,,,,,16.000,00,
A471,ASOLO,TV,,0.4,0.5,0.6,0.75,,,,,,,,,10.000,00,
A472,CASPERIA,RI,0.8,,,,,,,,,,,,,,
A473,ASSAGO,MI,0*,,,,,,,,,,,,,,
A474,ASSEMINI,CA,0.4,,,,,,,,,,,,,,
A475,ASSISI,PG,0*,,,,,,,,,,,,,,
A476,ASSO,CO,0.6,,,,,,,,,,,12.000,00,
A477,ASSOLO,OR,0.5,,,,,,,,,,,,,,
A478,ASSORO,EN,0.8,,,,,,,,,,,10.000.00,
A479,ASTI,AT,,0.54,0.66,0.78,0.79,,,,,,,,,,7.500,00,
A480,ASUNI,OR,0*,,,,,,,,,,,,,,
A481,ATELETA,AQ,0.4,,,,,,,,,,,,,,
A482,ATELLA,PZ,0.6,,,,,,,,,,,,,,
A484,ATENA LUCANA,SA,0.5,,,,,,,,,,,10.000,00,
A485,ATESSA,CH,,0.5,0.7,0.75,0.8,,,,,,,,,13.000,00,
A486,ATINA,FR,0.8,,,,,,,,,,,7.999.99,
A487,ATRANI,SA,0.5,,,,,,,,,,,,,,
A488,ATRI,TE,0.8,,,,,,,,,,,,,,
A489,ATRIPALDA,AV,0.8,,,,,,,,,,,,,,
A490,ATTIGLIANO,TR,0.8,,,,,,,,,,,,,,
A491,ATTIMIS,UD,0.4,,,,,,,,,,,12.500,00,
A492,ATZARA,NU,0*,,,,,,,,,,,,,,
A494,AUGUSTA,SR,0.8,,,,,,,,,,,,,,
A495,AULETTA,SA,0.8,,,,,,,,,,,,,,
A496,AULLA,MS,0.8,,,,,,,,,,,7.999,99,
A497,AURANO,VB,0*,,,,,,,,,,,,,,
A499,AURIGO,IM,0.8,,,,,,,,,,,,,,
A501,AURONZO DI CADORE,BL,0.4,,,,,,,,,,,5.999,99,
A502,AUSONIA,FR,0.8,,,,,,,,,,,,,,
A503,AUSTIS,NU,0.5,,,,,,,,,,,,,,
A506,AVEGNO,GE,0.8,,,,,,,,,,,,,,
A507,AVELENGO,BZ,0*,,,,,,,,,,,,,,
A508,AVELLA,AV,0.8,,,,,,,,,,,,,,
e così via per tutte le 58 pagine.
`;

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                resolve('');
            }
        };
        reader.readAsDataURL(file);
    });
    const data = await base64EncodedDataPromise;
    return {
        inlineData: {
            mimeType: file.type,
            data
        },
    };
};

const payItemSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "La descrizione della voce (es. 'Paga Base', 'Straordinari', 'Contributi IVS')." },
        quantity: { type: Type.NUMBER, description: "La quantità, se applicabile (es. ore di straordinario)." },
        rate: { type: Type.NUMBER, description: "L'importo unitario o la percentuale, se applicabile." },
        value: { type: Type.NUMBER, description: "Il valore economico totale della voce." }
    },
    required: ['description', 'value']
};

const leaveBalanceSchema = {
    type: Type.OBJECT,
    properties: {
        previous: { type: Type.NUMBER, description: "Saldo anno/periodo precedente." },
        accrued: { type: Type.NUMBER, description: "Maturato nel periodo." },
        taken: { type: Type.NUMBER, description: "Goduto nel periodo." },
        balance: { type: Type.NUMBER, description: "Saldo residuo." }
    },
    required: ['previous', 'accrued', 'taken', 'balance']
};

const payslipSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "Un UUID univoco generato per questo documento." },
        period: {
            type: Type.OBJECT,
            properties: {
                month: { type: Type.INTEGER, description: "Il mese di riferimento (es. 6 per Giugno)." },
                year: { type: Type.INTEGER, description: "L'anno di riferimento." },
            },
            required: ['month', 'year']
        },
        company: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Ragione Sociale dell'azienda." },
                taxId: { type: Type.STRING, description: "Partita IVA / Codice Fiscale dell'azienda." },
                address: { type: Type.STRING, description: "Indirizzo completo dell'azienda." },
            },
            required: ['name', 'taxId']
        },
        employee: {
            type: Type.OBJECT,
            properties: {
                firstName: { type: Type.STRING, description: "Nome del dipendente." },
                lastName: { type: Type.STRING, description: "Cognome del dipendente." },
                taxId: { type: Type.STRING, description: "Codice Fiscale del dipendente." },
                level: { type: Type.STRING, description: "Livello contrattuale del dipendente." },
                contractType: { type: Type.STRING, description: "Tipo di contratto (es. 'Commercio', 'Metalmeccanico')." },
            },
            required: ['firstName', 'lastName', 'taxId']
        },
        remunerationElements: { 
            type: Type.ARRAY, 
            items: payItemSchema, 
            description: "Elenco dettagliato delle voci fisse che compongono la retribuzione mensile di base (es. 'Paga Base', 'Contingenza', 'Scatti Anzianità', 'Superminimo'). Estrai questi dati dalla sezione 'Elementi della Retribuzione' o simile." 
        },
        incomeItems: { type: Type.ARRAY, items: payItemSchema, description: "Elenco di tutte le voci a favore del dipendente (competenze), INCLUSE le voci della retribuzione di base." },
        deductionItems: { type: Type.ARRAY, items: payItemSchema, description: "Elenco di tutte le voci a carico del dipendente (trattenute previdenziali, fiscali, etc.)." },
        grossSalary: { type: Type.NUMBER, description: "Retribuzione Lorda o Totale Competenze." },
        totalDeductions: { type: Type.NUMBER, description: "Totale delle trattenute." },
        netSalary: { type: Type.NUMBER, description: "Netto a pagare o Netto in busta." },
        taxData: {
            type: Type.OBJECT,
            properties: {
                taxableBase: { type: Type.NUMBER, description: "Imponibile Fiscale (o Imponibile IRPEF)." },
                grossTax: { type: Type.NUMBER, description: "Imposta Lorda IRPEF." },
                deductions: {
                    type: Type.OBJECT,
                    properties: {
                        employee: { type: Type.NUMBER, description: "Detrazione per lavoro dipendente." },
                        family: { type: Type.NUMBER, description: "Detrazioni per familiari a carico (se presenti, altrimenti 0)." },
                        total: { type: Type.NUMBER, description: "Totale delle detrazioni fiscali applicate." },
                    },
                     required: ['employee', 'total']
                },
                netTax: { type: Type.NUMBER, description: "Imposta Netta IRPEF." },
                regionalSurtax: { type: Type.NUMBER, description: "Addizionale Regionale IRPEF." },
                municipalSurtax: { type: Type.NUMBER, description: "Addizionale Comunale IRPEF." },
            },
            required: ['taxableBase', 'grossTax', 'deductions', 'netTax', 'regionalSurtax', 'municipalSurtax']
        },
        socialSecurityData: {
            type: Type.OBJECT,
            properties: {
                taxableBase: { type: Type.NUMBER, description: "Imponibile Previdenziale (o Imponibile INPS)." },
                employeeContribution: { type: Type.NUMBER, description: "Contributi previdenziali a carico del dipendente." },
                companyContribution: { type: Type.NUMBER, description: "Contributi previdenziali a carico dell'azienda." },
                inailContribution: { type: Type.NUMBER, description: "Contributo INAIL, se specificato (altrimenti 0)." },
            },
            required: ['taxableBase', 'employeeContribution', 'companyContribution']
        },
        tfr: {
            type: Type.OBJECT,
            properties: {
                taxableBase: { type: Type.NUMBER, description: "Imponibile TFR del mese." },
                accrued: { type: Type.NUMBER, description: "Quota TFR maturata nel mese." },
                previousBalance: { type: Type.NUMBER, description: "Fondo TFR al 31/12 dell'anno precedente o al periodo precedente." },
                totalFund: { type: Type.NUMBER, description: "Fondo TFR totale e aggiornato." },
            },
            required: ['taxableBase', 'accrued', 'previousBalance', 'totalFund']
        },
        leaveData: {
            type: Type.OBJECT,
            properties: {
                vacation: { ...leaveBalanceSchema, description: "Dettaglio Ferie." },
                permits: { ...leaveBalanceSchema, description: "Dettaglio Permessi/ROL." },
            },
            required: ['vacation', 'permits']
        },
    },
    required: ['id', 'period', 'company', 'employee', 'remunerationElements', 'incomeItems', 'deductionItems', 'grossSalary', 'totalDeductions', 'netSalary', 'taxData', 'socialSecurityData', 'tfr', 'leaveData']
};


export const analyzePayslip = async (file: File): Promise<Payslip> => {
    const imagePart = await fileToGenerativePart(file);
    const prompt = `Esegui un'analisi estremamente analitica e approfondita di questa busta paga italiana. Non tralasciare alcun dettaglio. Interpreta ogni singola voce, numero e codice, anche se posizionata in modo non standard. Popola lo schema JSON fornito con la massima precisione e granularità.
- **Dati Anagrafici e Contrattuali**: Estrai tutti i dati relativi all'azienda e al dipendente, inclusi livello, CCNL, qualifica, etc.
- **Elementi della Retribuzione**: Identifica la sezione 'Elementi della Retribuzione' (o simile) e popola l'array \`remunerationElements\` con ogni singola voce che contribuisce alla retribuzione mensile lorda (es. Paga Base, Contingenza, Scatti Anzianità, Superminimo, E.D.R.). È fondamentale che questa sezione sia completa.
- **Corpo della Busta Paga**: Popola \`incomeItems\` con TUTTE le competenze a favore del dipendente (incluse quelle di base già elencate in \`remunerationElements\`) e \`deductionItems\` con tutte le trattenute.
- **Dati Fiscali, Previdenziali, TFR**: Dettaglia con precisione tutte le sezioni relative a IRPEF, contributi INPS, Trattamento di Fine Rapporto, e lo stato di ferie e permessi.
- **Accuratezza Numerica**: Assicurati che tutti i campi numerici siano correttamente parsati come numeri. Non inserire il simbolo dell'euro o altri caratteri non numerici.
- **Completezza**: Se un dato non è esplicitamente presente, usa 0 per i valori numerici e stringhe vuote per il testo. Non lasciare campi vuoti se sono richiesti.
- **ID Univoco**: Genera un UUID per il campo 'id'.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { text: prompt },
            imagePart
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: payslipSchema
        }
    });
    
    const jsonStr = response.text.trim();
    try {
        const payslipData = JSON.parse(jsonStr);
        
        // Fallback ID generation
        if (!payslipData.id) {
           payslipData.id = `payslip-${Date.now()}-${Math.random()}`;
        }
        
        return payslipData as Payslip;
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON:", jsonStr, e);
        throw new Error("L'analisi ha prodotto un risultato non valido. Assicurati che il file sia una busta paga chiara.");
    }
};

export const getComparisonAnalysis = async (p1: Payslip, p2: Payslip): Promise<string> => {
    const getMonthName = (month: number) => new Date(2000, month - 1, 1).toLocaleString('it-IT', { month: 'long' });

    const prompt = `In qualità di consulente del lavoro, analizza e confronta le seguenti due buste paga in formato JSON.
Busta Paga 1 (${getMonthName(p1.period.month)} ${p1.period.year}):
${JSON.stringify(p1, null, 2)}

Busta Paga 2 (${getMonthName(p2.period.month)} ${p2.period.year}):
${JSON.stringify(p2, null, 2)}

Fornisci un'analisi sintetica ma professionale che metta in luce le differenze principali. Spiega le possibili cause delle variazioni più significative (es. bonus, straordinari, conguagli fiscali, scatti di anzianità). 
Struttura la risposta in modo chiaro e facile da capire per un non addetto ai lavori. Concentrati solo sull'analisi comparativa.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
};

export const getPayslipSummary = async (payslip: Payslip): Promise<string> => {
    const prompt = `In qualità di consulente del lavoro, crea un'analisi descrittiva chiara e concisa per la seguente busta paga in formato JSON. La descrizione deve essere facilmente comprensibile per un non addetto ai lavori. Struttura la risposta in 2-3 paragrafi.
- **Paragrafo 1:** Inizia con una frase riassuntiva sul risultato netto del mese. Spiega brevemente la relazione tra la retribuzione lorda, le trattenute totali e il netto a pagare.
- **Paragrafo 2:** Evidenzia le voci più significative che hanno composto lo stipendio del mese (es. straordinari, bonus, indennità particolari) e le principali trattenute (contributi previdenziali e imposte IRPEF).
- **Paragrafo 3 (opzionale):** Se ci sono elementi degni di nota come conguagli fiscali, un'alta quota di TFR o variazioni importanti rispetto a uno stipendio "standard", menzionali brevemente.
Mantieni un tono professionale ma accessibile. Non usare formattazione markdown, solo testo semplice. Ecco i dati della busta paga:
${JSON.stringify(payslip, null, 2)}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
};


export const getChatResponse = async (
    history: ChatMessage[],
    question: string,
    context: {
        payslips?: Payslip[];
        file?: File;
        focusedPayslip?: Payslip | null;
        payslipsToCompare?: [Payslip, Payslip] | null;
        includeTaxTables?: boolean;
    }
) => {
    let systemInstruction = `Sei un consulente del lavoro virtuale, esperto di tutti i contratti collettivi nazionali di lavoro (CCNL) italiani e della normativa giuslavoristica. Fornisci risposte precise, dettagliate e professionali. Tuttavia, ricorda sempre all'utente che, essendo un'intelligenza artificiale, le tue analisi sono a titolo informativo e non sostituiscono il parere di un professionista abilitato. Invita sempre l'utente a consultare un consulente del lavoro o un CAF per avere certezze legali e fiscali. Non inventare dati. Se non trovi la risposta nei dati forniti o nelle tue conoscenze, dillo chiaramente.`;

    if (context.payslipsToCompare) {
        const [p1, p2] = context.payslipsToCompare;
        systemInstruction += `\nL'utente sta confrontando queste due buste paga. Basa le tue risposte su di esse, usandole come contesto primario:\nBusta Paga 1: ${JSON.stringify(p1, null, 2)}\nBusta Paga 2: ${JSON.stringify(p2, null, 2)}`;
    } else if (context.focusedPayslip) {
        systemInstruction += `\nL'utente sta visualizzando questa busta paga. Basa le tue risposte principalmente su di essa, usandola come contesto primario:\n${JSON.stringify(context.focusedPayslip, null, 2)}`;
    } else if (context.payslips && context.payslips.length > 0) {
        systemInstruction += `\nEcco i dati delle buste paga dell'utente che hai a disposizione come archivio:\n${JSON.stringify(context.payslips, null, 2)}`;
    }

    if (context.file) {
        systemInstruction += `\nL'utente ha anche allegato un documento. Usalo come contesto primario se la domanda sembra riferirsi ad esso.`;
    }

    if (context.includeTaxTables) {
        systemInstruction += `\nL'utente ha richiesto di usare come riferimento il seguente documento con le tabelle delle addizionali comunali. Usalo come contesto per rispondere a domande relative a questo argomento.\n\n--- INIZIO DOCUMENTO ADDIZIONALI COMUNALI ---\n${MUNICIPAL_TAX_TABLES_TEXT}\n--- FINE DOCUMENTO ADDIZIONALI COMUNALI ---`;
    }

    const conversationHistory = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    const userParts: any[] = [{ text: question }];
    if (context.file) {
        const filePart = await fileToGenerativePart(context.file);
        userParts.unshift(filePart);
    }
    
    const contents = [...conversationHistory, { role: 'user', parts: userParts }];

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return responseStream;
};

const historicalAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "Un'analisi testuale riassuntiva e professionale delle principali differenze e possibili cause." },
        averageNetSalary: { type: Type.NUMBER, description: "La media degli stipendi netti dei mesi precedenti." },
        averageGrossSalary: { type: Type.NUMBER, description: "La media degli stipendi lordi dei mesi precedenti." },
        differingItems: {
            type: Type.ARRAY,
            description: "Un elenco delle voci di costo che presentano le differenze più significative.",
            items: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING, description: "La descrizione della voce (es. 'Straordinari', 'Contributi IVS')." },
                    currentValue: { type: Type.NUMBER, description: "Il valore della voce nella busta paga corrente." },
                    averageValue: { type: Type.NUMBER, description: "Il valore medio della voce nelle buste paga precedenti. Se la voce è nuova, questo valore è 0." },
                    difference: { type: Type.NUMBER, description: "La differenza tra il valore corrente e la media." },
                    type: { type: Type.STRING, description: "Il tipo di voce: 'income' (competenza), 'deduction' (trattenuta), o 'other' (es. TFR, ferie)." },
                    comment: { type: Type.STRING, description: "Un breve commento dell'IA sulla possibile causa o significato di questa differenza." }
                },
                required: ['description', 'currentValue', 'averageValue', 'difference', 'type', 'comment']
            }
        }
    },
    required: ['summary', 'averageNetSalary', 'averageGrossSalary', 'differingItems']
};


export const getHistoricalAnalysis = async (currentPayslip: Payslip, historicalPayslips: Payslip[]): Promise<HistoricalAnalysisResult> => {
     if (historicalPayslips.length === 0) {
        throw new Error("Nessuna busta paga storica fornita per l'analisi.");
    }
    
    const prompt = `In qualità di esperto consulente del lavoro, analizza la busta paga corrente in relazione allo storico delle buste paga precedenti. L'obiettivo è identificare e spiegare le variazioni significative.

**Busta Paga Corrente (${currentPayslip.period.month}/${currentPayslip.period.year}):**
${JSON.stringify(currentPayslip, null, 2)}

**Storico Buste Paga Precedenti:**
${JSON.stringify(historicalPayslips, null, 2)}

**Istruzioni:**
1.  **Calcola le medie:** Calcola la media dello stipendio lordo e netto dei mesi precedenti.
2.  **Identifica le differenze:** Confronta ogni voce (competenze, trattenute, TFR, ferie, etc.) della busta paga corrente con la media delle stesse voci nello storico. Se una voce è presente solo nel mese corrente, considerala una nuova voce.
3.  **Fornisci un'analisi:** Scrivi un riassunto chiaro e conciso in italiano che spieghi le principali differenze. Ad esempio, se lo stipendio netto è più alto, spiega perché (es. bonus, meno tasse, etc.).
4.  **Elenca le voci significative:** Popola l'array 'differingItems' solo con le voci che hanno una variazione rilevante (es. una differenza di più di qualche euro, o voci completamente nuove/mancanti). Per ogni voce, fornisci un breve commento che ne spieghi la natura.
5.  **Rispetta lo schema:** Restituisci i risultati esclusivamente nel formato JSON specificato, senza testo aggiuntivo.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: historicalAnalysisSchema
        }
    });

    const jsonStr = response.text.trim();
    try {
        const analysisData = JSON.parse(jsonStr);
        return analysisData as HistoricalAnalysisResult;
    } catch (e) {
        console.error("Failed to parse Gemini historical analysis response as JSON:", jsonStr, e);
        throw new Error("L'analisi storica ha prodotto un risultato non valido.");
    }
};