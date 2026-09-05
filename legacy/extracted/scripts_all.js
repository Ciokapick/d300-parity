// ===== #1  form1.btnDoc.btnIstoric  [click]  (application/x-javascript)
var mesaj = "" +
"\n- 19.11.2025 Vesiunea A11.0.5 - Eliminarea corelatiilor dintre rd.7 si rd.7.1\
\n- 23.09.2025 Vesiunea A11.0.2 - Corectarea unor validari in cazul compararii de valori negative\
\n- 17.09.2025 Vesiunea A11.0.1 - Adaugare cod caen Rev2\
\n- 03.09.2025 Vesiunea A11.0.0 - Modificare conform OPANAF 2131/02.09.2025\
\n- 11.02.2025 Versiunea A10.0.0 - utilizeaza nomenclatorul CAEN rev.3, valabil de la 01 ianuarie 2025\
\n- 22.09.2023 Versiunea A8.0.3 - modificare versiune xmlns\
\n- 21.09.2023 Versiunea A8.0.2 - eliminare constrangere rd.14 >= rd14.1 + rd.14.2 \
\n- 18.09.2023 Versiunea A8.0.1 - corectare calcul suma de control (+rd.14.1 + rd.14.2) \
\n- 05.07.2023 Versiunea A8.0.0 - conform OPANAF \
\n\nVerificati actualizarea aplicatiei la www.anaf.ro/servicii_online/declaratii_electronice/descarcare_declaratii.";
xfa.host.messageBox(mesaj,"Versiuni:", 3);

// ===== #2  form1.btnDoc.btnIstoric  [mouseEnter]  (application/x-javascript)
this.caption.font.underline = "1";

// ===== #3  form1.btnDoc.btnIstoric  [mouseExit]  (application/x-javascript)
this.caption.font.underline = "0";

// ===== #4  form1.btnDoc.btnIstoric  [initialize]  (application/x-javascript)
//this.access = "open";

// ===== #5  form1.btnDoc.btnHelp  [click]  (application/x-javascript)
var cChoice = app.popUpMenu("Indicaţii generale", "-",
//"Corelatii",
//["Corelatii","Cod 10","Cod 20", "Cod 30"],
//"Populare automata a tabelului Informatii despre facturi",
"Depunerea",
//"Rectificarea",
["Scanarea documentelor","Metoda optima","Bunele practici"],
"-"//,
//["Legaturi utile","Cursul de schimb BNR"]
);

var info = "" +
"\n1. Introducere date:\
\n- Câmpurile text nu trebuie să conţină diacritice şi nici caractere nevalide ($, <,>, etc.).\
\n- Utilizarea caracterelor speciale: Introduceti text fara caractere speciale. Puteti sa folositi literele alfabetului latin (A-Z, a-z), cifrele arabe (0-9), semnul punct (.), semnul minus (-) si spatii ( )\
\n- Utilizaţi funcţia automată tooltip de asistenţă a utilizatorului: Plasaţi cursorul mouse-ului peste un câmp şi pe ecran se afişează informaţii utile pentru completare.\
\n\n2. Validarea formularului  completat, deblocarea dupa validare:\
\n- Un formular corect şi complet se validează prin acţionarea butonului VALIDARE.\
\n- În urma unei validari reuşite:\
\n  - se generează si ataşează automat fişierul .xml,\
\n  - se poata atasa fisierul .zip (daca este cazul),\
\n  - se blocheaza formularul pentru editare.\
\n\n Pentru deblocarea formularului în vederea reeditarii utilizaţi butonul DEBLOCARE.\
\n Atenţie!\nFişierul .xml ataşat anterior se şterge în mod automat ca urmare a  deblocării.";

var scan = "" + 
"\nPentru o scanare optimă, urmaţi cei 5 paşi de mai jos:\
\n1. Deschideţi funcţia Preview sau Prescan din programul de scanare.\
\n2. Reglaţi chenarul de selectare, după cum este necesar.\
\n3. Selectaţi tipul: fulltone (pentru documente cu zone mari de aceeaşi culoare); halftone\
\n(imagini în scală de gri, documente multicolore).\
\n4. Selectaţi rezoluţia de scanare.\
\nRezoluţia de scanare se măsoară în dpi (puncte pe inchi) şi are un efect semnificativ asupra calităţii.\
\nO rezoluţie de 75 dpi este suficientă pentru o afişare de calitate a documentelor dumneavoastră pe ecranul computerului.\
\nCu toate acestea, vă rugăm să utilizaţi o rezoluţie mai mare, astfel încât să se poată tipări un document de bună calitate.\
\nRezolutia recomandata: 300 dpi, nu mai mica de 200 dpi.\
\n5. Porniţi scanarea, făcând clic pe butonul “Scan”.\
\n\nPentru documentele text formate în cea mai mare parte din elemente grafice precum linii sau caractere,\
\nselectaţi opţiunea 'fulltone' şi, pentru a beneficia de cele mai bune rezultate, utilizaţi o 'rezoluţie medie' de '150 dpi'. \
\nDe asemenea, puteţi controla dimensiunea fişierelor dumneavoastră scanând documentele în scală de gri.\
\nDacă doriţi să editaţi documentele scanate, salvaţi-le în format gif. Ideal este să salvati documentele scanate ca fişiere PDF,\
\nastfel încât acestea să fie recomprimate, dar şi datorită faptului că formatul PDF asigură afişarea documentelor dumneavoastră într-o formă nemodificată.\
\nDacă la crearea documentelor scanate veţi respecta aceste recomandări, veţi reuşi să ataşaţi\
\ncu uşurinţă acestui formular documentele dumneavoastră.";

var arhv = "" + 
"\n1.Scanati documente fizice originale ( nu scanati copii sau documente transmise prin fax).\
\n2.Setati dimensiunile documentului scanat identic cu cele ale documentului fizic (A4, de exemplu)\
\n3.Daca documentul fizic este compus din mai multe pagini, scanati paginile in ordinea lor logica si salvati-le intr-un singur fisier.\
\n4.Daca doriti sa adaugati documente create cu aplicatii informatice, de exemplu aplicatii pentru editarea de text sau pentru foi de calcul(Microsoft Word,Microsoft Excel)atasati fisierele in formatul cu care au fost create sau utilizati optiunea 'print to pdf'.\
\n5.Salvati arhiva de fisiere în format zip.";

var doc = "" + 
"\nFormularul (300) 'Decont de taxă pe valoarea adăugată' se depune la organul fiscal competent, la următoarele termene:\
\na) lunar, până la data de 25 inclusiv a lunii următoare celei pentru care se depune decontul, de persoanele impozabile pentru care perioada fiscală este luna calendaristică, potrivit prevederilor art. 322 din Codul fiscal;\
\nb) trimestrial, până la data de 25 inclusiv a primei luni din trimestrul următor celui pentru care se depune decontul, de persoanele impozabile pentru care perioada fiscală este trimestrul calendaristic, potrivit prevederilor art. 322 din Codul fiscal;\
\nc) semestrial, până la data de 25 inclusiv a primei luni din semestrul următor celui pentru care se depune decontul, de persoanele impozabile pentru care organul fiscal competent a aprobat ca perioadă fiscală semestrul calendaristic, potrivit prevederilor art. 322 alin. (9) din Codul fiscal şi ale pct. 103 alin. (4) din Normele metodologice de aplicare a Titlului VII din Codul fiscal, aprobate prin Hotararea Guvernului nr.1/ 2016.;\
\nd) anual, până la data de 25 ianuarie inclusiv a anului următor celui pentru care se depune\
decontul, de persoanele impozabile prevăzute la pct. 103 alin. (6) din Normele metodologice şi de persoanele impozabile pentru care organul fiscal competent a aprobat ca perioadă fiscală anul calendaristic, potrivit prevederilor art. 322 alin. (9) din Codul fiscal şi ale pct. 103 alin. (4) din Normele metodologice;\
\ne) până la data de 25 a celei de-a treia luni a trimestrului calendaristic, pentru primele două luni ale aceluiaşi trimestru calendaristic, de persoanele impozabile care utilizează trimestrul ca perioadă fiscală şi care efectuează o achiziţie intracomunitară de bunuri taxabilă în România, dacă exigibilitatea taxei aferente achiziţiei intracomunitare intervine în a doua lună a respectivului trimestru. Decontul se va depune pentru luna a doua a trimestrului, dar va cuprinde şi operaţiunile realizate în prima lună a acestuia. În situaţia în care exigibilitatea taxei aferente achiziţiei intracomunitare intervine în prima sau în a treia lună a trimestrului calendaristic, sunt aplicabile în mod corespunzător dispoziţiile lit. a) din prezentul paragraf.\
\nFormularul (300) 'Decont de taxă pe valoarea adăugată' pentru care termenul de declarare se împlineşte la 25 decembrie se depune la organul fiscal competent până la data de 21 decembrie. În situaţia în care data de 21 decembrie este zi nelucrătoare, formularul se depune până în ultima zi lucrătoare anterioară datei de 21 decembrie, potrivit art. 155 alin. (2) din Legea nr. 207/2015 privind Codul de procedură fiscală, cu modificările şi completările ulterioare (Codul de procedură fiscală).";

var rct = "" + 
"\nDeclaraţia rectificativă se utilizează pentru:\
\n  - corectarea impozitului pe venit, precum şi a contribuţiilor sociale datorate;\
\n  - modificarea datelor de identificare a persoanei fizice;\
\n  - modificarea unor date referitoare la categoria/sursa veniturilor sau a nivelului acestora, potrivit legii;\
\n  - modificarea unor date referitoare la contribuţia de asigurări sociale şi contribuţia de asigurări sociale de sănătate;\
\n  - corectarea altor informaţii prevăzute de formular.\
\n\nATENTIE:\
\nDeclaraţia rectificativă se completează înscriindu-se toate datele şi informaţiile prevăzute în capitolul supus rectificării, inclusiv cele care nu diferă faţă de declaraţia iniţială.\
\n\nDeclaraţia rectificativă se întocmeşte pe acelaşi formular, bifându-se cu X căsuţele aflate pe prima pagină a formularului (capitolul I 'Date privind  impozitul pe veniturile realizate și contribuțiile sociale datorate în anul 2018' şi/sau capitolul II 'Date privind impozitul pe veniturile estimate/norma de venit a se realiza în România şi contribuţiile sociale datorate în anul 2019', după caz).\
\n\nLa rectificarea declarației se vor avea în vedere următoarele:\
\n  - declarația inițială este declarația care nu are nicio bifă de rectificativă selectată;\
\n  - este permisă depunerea unei singure declarații inițiale;\
\n  - declarația rectificativă este declarația cu cel puțin o bifă de rectificativă selectată (la capitolul I sau capitolul II sau la ambele capitole);\
\n  - o declarație rectificativă care rectifică ambele capitole (capitolul I și capitolul II)  trebuie sa aibă ambele bife de rectificare selectate;\
\n\nContribuabilii pot rectifica impozitul pe venitul estimat până la data de 31 decembrie a anului de impunere. Fac excepție contribuabilii care nu au obligația completării capitolului I din declarație și care rectifică declarația în condiţiile prevăzute de Legea nr.207/2015 privind Codul de procedură fiscală, cu modificările şi completările ulterioare."; 

var nChoise = cChoice;
if (nChoise == "Indicaţii generale") xfa.host.messageBox(info,"Indicaţii generale", 3);
if (nChoise == "Rectificarea")xfa.host.messageBox(rct,"Popularea automata a tabelului cu informatii despre facturi", 3);
if (nChoise == "Depunerea")xfa.host.messageBox(doc, "Termenul si modalitatea de depunere",3);
if (nChoise == "Metoda optima")xfa.host.messageBox(scan,"Recomandari pentru scanarea documentelor", 3);
if (nChoise == "Bunele practici")xfa.host.messageBox(arhv,"Recomandari pentru atasarea fisierelor", 3);
if (nChoise == "Cursul de schimb BNR") xfa.host.gotoURL("http://www.bnr.ro/Cursul-de-schimb-3544.aspx");
/*if (nChoise == "Ordinul nr.2048/2016") {
var raspuns = xfa.host.messageBox("Daca doriti sa consultati online legislatia specifica, alegeti optiunea Da (Yes). \nEste necesara o conexiune la internet.\nAsteptati legatura cu anaf.ro...","Confirmaţi accesarea unui hiperlink",2,2);
if (raspuns == 4) xfa.host.gotoURL("https://static.anaf.ro/static/10/Anaf/legislatie/OPANAF_2048_2016.pdf");//xfa.host.messageBox("Intrebari frecvente","Intrebari frecvente", 3);
}
*/

// ===== #6  form1.btnDoc.btnHelp  [mouseExit]  (application/x-javascript)
this.caption.font.underline = "0";

// ===== #7  form1.btnDoc.btnHelp  [mouseEnter]  (application/x-javascript)
this.caption.font.underline = "1";

// ===== #8  form1.btnDoc.btnHelp  [initialize]  (application/x-javascript)
//this.access = "open";

// ===== #9  form1.btnDoc.btnRpt  [mouseEnter]  (application/x-javascript)
this.caption.font.underline = "1";

// ===== #10  form1.btnDoc.btnRpt  [mouseExit]  (application/x-javascript)
this.caption.font.underline = "0";

// ===== #11  form1.btnDoc.btnRpt  [click]  (application/x-javascript)
var mesaj = "" +
"Va rugam sa raportati problema tehnica prin intermediul formularului unic disponibil la adresa de internet www.anaf.ro/asistpublic/\
\n\nDaca doriti sa continuati, alegeti optiunea Da (Yes).\
\nEste necesara o conexiune la internet.\
\nAsteptati legatura cu anaf.ro...";

var raspuns = xfa.host.messageBox(mesaj,"Confirmaţi accesarea unui hiperlink",2,2);
		if( raspuns == 4){
		xfa.host.gotoURL("https://www.anaf.ro/asistpublic/");
}

// ===== #12  form1.btnDoc.btnRpt  [initialize]  (application/x-javascript)


// ===== #13  form1.btnDoc.btnValid  [click]  (application/x-javascript)
var valid = 0;
// The xfa.host.messageBox() is in the click event, which fires after the error fields are hightlighted
// The function updates the errMsg and errCount global variables. If there are errors then alert the user
if (errMsg.value !== "Nu ati completat toate campurile obligatorii. Verificati formularul si completati toate campurile evidentiate:") {
valid = 1;
	// Check the length of the errCount. If there are five or more errors, just give a generic message to the user
	if (errCount.value.length != null) {
		if (errCount.value.length == 1) {var txt1 = "camp."; var txt2 = "campul evidentiat";}
		if (errCount.value.length > 1) {var txt1 = "campuri."; var txt2 = 'campurile evidentiate';}
		errMsg.value = "Nu ati completat toate campurile obligatorii!\n\nTrebuie sa mai completati " + errCount.value.length + " " + txt1 + "\nCompletati " + txt2 + " cu culoarea rosu! \n\nMultumesc!";
	}
	xfa.host.messageBox(errMsg.value, "Date incomplete", 0, 0); 
}//eof verificare campuri obligatorii
execValidate(); 
if (valid == 0){// au fost completate campurile obligatorii
	//calculez suma de control
	var suma = date.comert.r1.c2.rawValue + date.comert.r2.c2.rawValue  + date.comert.r3.c2.rawValue + date.comert.r3_1.c2.rawValue + date.comert.r4.c2.rawValue + date.comert.r5.c2.rawValue + date.comert.r5.c3.rawValue + date.comert.r5_1.c2.rawValue  + date.comert.r5_1.c3.rawValue +
				date.comert.r6.c2.rawValue  + date.comert.r6.c3.rawValue  + date.comert.r7.c2.rawValue  + date.comert.r7.c3.rawValue + date.comert.r7_1.c2.rawValue + date.comert.r7_1.c3.rawValue  + date.comert.r8.c2.rawValue + date.comert.r8.c3.rawValue +
				date.livrari.r9.c2.rawValue+ date.livrari.r9.c3.rawValue  + date.livrari.r10.c2.rawValue + date.livrari.r10.c3.rawValue  +
				date.livrari.r11.c2.rawValue + date.livrari.r11.c3.rawValue +  date.livrari.r12.c2.rawValue + date.livrari.r12.c3.rawValue + date.livrari.r12_1.c2.rawValue + date.livrari.r12_1.c3.rawValue +
				date.livrari.r12_2.c2.rawValue + date.livrari.r12_2.c3.rawValue  +
				date.livrari.r13.c2.rawValue + date.livrari.r14.c2.rawValue + date.livrari.r15.c2.rawValue + date.livrari.r16.c2.rawValue + date.livrari.r16.c3.rawValue + date.livrari.r17.c2.rawValue + date.livrari.r17.c3.rawValue + date.livrari.r18.c2.rawValue + date.livrari.r18.c3.rawValue +
				date.livrari.r19.c2.rawValue + date.livrari.r19.c3.rawValue +
				date.achizitiiRO.r20.c2.rawValue + date.achizitiiRO.r20.c3.rawValue + date.achizitiiRO.r20_1.c2.rawValue + date.achizitiiRO.r20_1.c3.rawValue + date.achizitiiRO.r21.c2.rawValue + date.achizitiiRO.r21.c3.rawValue + date.achizitiiRO.r22.c2.rawValue + date.achizitiiRO.r22.c3.rawValue +
				date.achizitiiRO.r22_1.c2.rawValue + date.achizitiiRO.r22_1.c3.rawValue + date.achizitiiRO.r23.c2.rawValue + date.achizitiiRO.r23.c3.rawValue +
				date.achizitiiIMP.r24.c2.rawValue + date.achizitiiIMP.r24.c3.rawValue + date.achizitiiIMP.r25.c2.rawValue + date.achizitiiIMP.r25.c3.rawValue  +
				date.achizitiiIMP.r27.c2.rawValue + date.achizitiiIMP.r27.c3.rawValue + date.achizitiiIMP.r27_1.c2.rawValue + date.achizitiiIMP.r27_1.c3.rawValue +
				date.achizitiiIMP.r27_2.c2.rawValue + date.achizitiiIMP.r27_2.c3.rawValue  +
				date.achizitiiIMP.r28.c3.rawValue + date.achizitiiIMP.r29.c3.rawValue + date.achizitiiIMP.r30.c2.rawValue + date.achizitiiIMP.r30_1.c2.rawValue + date.achizitiiIMP.r31.c2.rawValue + date.achizitiiIMP.r31.c3.rawValue +
				date.achizitiiIMP.r32.c3.rawValue + date.achizitiiIMP.r33.c3.rawValue + date.achizitiiIMP.r34.c2.rawValue + date.achizitiiIMP.r34.c3.rawValue + date.achizitiiIMP.r35.c3.rawValue + date.achizitiiIMP.r36.c3.rawValue +
				date.regularizari.r37.c3.rawValue + date.regularizari.r38.c3.rawValue + date.regularizari.r39.c3.rawValue + date.regularizari.r40.c3.rawValue + date.regularizari.r41.c3.rawValue + date.regularizari.r42.c3.rawValue + date.regularizari.r43.c3.rawValue +
				date.regularizari.r44.c3.rawValue + date.regularizari.r45.c3.rawValue + date.regularizari.r46.c3.rawValue +
				date.r47.c1.rawValue + date.r47.c2.rawValue + date.r47.c3.rawValue + date.r48.c1.rawValue + date.r48.c2.rawValue + date.r48.c3.rawValue;
	
	Antet.metaDate.totalPlata_A.rawValue = suma;
	//Antet.metaDate.totalPlata_A.rawValue = utile.sumaControl();
	//sterg semantura
	formular.sterg_signature();
	//sterg fisiere atasate			
	utile.removeDataObjects();
	//validez constrangeri si generez fisier xml
	genValid.validForm();
	//inchid mesaj de asteptare
	xfa.host.setFocus(btnSalt);
	// permit acces la atasare fisiere
	btnZip.access = "open";
	// Deschid panel fisiere atasate 
	var attachments = event.target.dataObjects;
	if (attachments != null){ 
		event.target.viewState = {overViewMode:7};
	}
	else event.target.viewState = {overViewMode:1};
	}

//else {//nu au fost completate campurile obligatorii
	//app.alert("Nu ati completat toate campurile obligatorii.\n\nCompletati campurile evidentiate si reluati validarea!");
//}

// ===== #14  form1.btnDoc.btnValid  [exit]  (application/x-javascript)
btnWait.presence = "hidden";

// ===== #15  form1.btnDoc.btnValid  [enter]  (application/x-javascript)
btnWait.presence = "visible";

// ===== #16  form1.btnDoc.btnValid  [mouseExit]  (application/x-javascript)
this.caption.font.underline = "0";

// ===== #17  form1.btnDoc.btnValid  [mouseEnter]  (application/x-javascript)
this.caption.font.underline = "1";

// ===== #18  form1.btnDoc.btnValid  [mouseUp]  (application/x-javascript)
// This script is in the mouseUp event, so that it renders before the xfa.host.messageBox()
// Reset the errMsg global variable and the errCount global variable
errMsg.value = "Nu ati completat toate campurile obligatorii. Verificati formularul si completati toate campurile evidentiate:"; 
errCount.value = ""; 

// Call the function, passing the name of the root node
oblig.CheckForErrors(form1);
//sterg continut versiunea print

// ===== #19  form1.btnDoc.btnValid  [initialize]  (application/x-javascript)


// ===== #20  form1.btnDoc.btnList  [click]  (application/x-javascript)
xfa.host.print(1, "0", (xfa.host.numPages -1).toString(), 0, 0, 0, 0, 0);

// ===== #21  form1.btnDoc.btnList  [mouseEnter]  (application/x-javascript)
this.caption.font.underline = "1";

// ===== #22  form1.btnDoc.btnList  [mouseExit]  (application/x-javascript)
this.caption.font.underline = "0";

// ===== #23  form1.btnDoc.btnList  [initialize]  (application/x-javascript)


// ===== #24  form1.btnDoc.btnDebloc  [click]  (application/x-javascript)
formular.deblochez(); // deblochez formularul
formular.sterg_signature(); // sterg semnatura, sterg atasamente

Antet.IdDoc.universalCode.access="readOnly";
Antet.IdDoc.sgn.access="readOnly";// blochez semnatura
event.target.viewState = {overViewMode:1};// inchid panelul cu fisiere atasate

// ===== #25  form1.btnDoc.btnDebloc  [mouseEnter]  (application/x-javascript)
this.caption.font.underline = "1";

// ===== #26  form1.btnDoc.btnDebloc  [mouseExit]  (application/x-javascript)
this.caption.font.underline = "0";

// ===== #27  form1.btnDoc.btnDebloc  [initialize]  (application/x-javascript)


// ===== #28  form1.btnDoc.btnZip  [click]  (application/x-javascript)
attach.adauga_zip();
/*
var prez1=form1.date_identificare.AVERTISMENT.presence;
test1.adauga_zip();
var err1=test1.verific_zip();
     if (err1==1)
     {
       // err1==0 ==>eroare: fisier .ZIP neatasat sau mai multe sau cu nume lung      
        validari.blochez();
        if (prez1!="invisible")
        {
          form1.date_identificare.AVERTISMENT.presence="invisible" ; 
          form1.date_identificare.signature.presence="visible" ;
        }
       } 
*/

// ===== #29  form1.btnDoc.btnZip  [mouseEnter]  (application/x-javascript)
this.caption.font.underline = "1";

// ===== #30  form1.btnDoc.btnZip  [mouseExit]  (application/x-javascript)
this.caption.font.underline = "0";

// ===== #31  form1.btnDoc.btnWait  [initialize]  (application/x-javascript)


// ===== #32  form1.btnDoc.btnSalt  [click]  (application/x-javascript)
xfa.host.setFocus(btnTab.btnCC);

// ===== #33  form1.btnDoc.btnSalt  [mouseExit]  (application/x-javascript)
this.caption.font.underline = "0";

// ===== #34  form1.btnDoc.btnSalt  [mouseEnter]  (application/x-javascript)
this.caption.font.underline = "1";

// ===== #35  form1.btnDoc.btnSalt  [initialize]  (application/x-javascript)


// ===== #36  form1.btnDoc  [initialize]  (application/x-javascript)


// ===== #37  form1.Antet.IdDoc.sgn  [ready]  (application/x-javascript)


// ===== #38  form1.Antet.nr_evid  [calculate]  (application/x-javascript)
this.mandatory = "error";
this.rawValue = '';
utile.manageRegistrationNumber();

// ===== #39  form1.Antet.opInterne.mtdSimplificata  [mouseUp]  (application/x-javascript)
if (this.rawValue == 0)this.caption.font.weight = "normal";
if (this.rawValue == 1)this.caption.font.weight = "bold";

// ===== #40  form1.Antet.opInterne.mtdSimplificata  [initialize]  (application/x-javascript)
if (this.rawValue == 0)this.caption.font.weight = "normal";
if (this.rawValue == 1)this.caption.font.weight = "bold";

// ===== #41  form1.Antet.opInterne.mtdSimplificata  [change]  (application/x-javascript)
if (this.rawValue == 1){
	date.comert.access = "readOnly";
	var f1 = xfa.resolveNode("date.comert").somExpression;
	xfa.host.resetData(f1);
	
	date.achizitiiRO.access = "readOnly";
	var f1 = xfa.resolveNode("date.achizitiiRO").somExpression;
	xfa.host.resetData(f1);
	
	date.achizitiiIMP.r30_1.c2.access = 'readOnly';
	date.achizitiiIMP.r30_1.c2.rawValue = '';
}
else{
	date.comert.access = "open";
	date.achizitiiRO.access = "open";
	date.achizitiiIMP.r30_1.c2.access = 'open';
}

// ===== #42  form1.Antet.metaDate.an_r  [change]  (application/x-javascript)
if (xfa.event.newText.match(/[^0-9 ]/)){
	xfa.event.change = "";
}

// ===== #43  form1.Antet.metaDate.an_r  [exit]  (application/x-javascript)
var an = this.rawValue;
if (an != null && an < 2024){
	app.alert("Anul trebuie sa fie mai mare sau egal cu 2024!");
	xfa.host.setFocus(this);
}

// ===== #44  form1.Antet.metaDate.tipDecont  [change]  (application/x-javascript)
// if Control is held, clear selection
if (xfa.event.modifier){
	xfa.event.change = "";
}

// ===== #45  form1.Antet.metaDate.tipDecont  [exit]  (application/x-javascript)
utile.check_tipDecont();

// ===== #46  form1.Antet.metaDate.luna_r  [change]  (application/x-javascript)
// if Control is held, clear selection
if (xfa.event.modifier){
	xfa.event.change = "";
}

// ===== #47  form1.Antet.metaDate.luna_r  [exit]  (application/x-javascript)
var luna = this.rawValue;
var an = an_r.rawValue;
if (an == 2024 && luna < 5){
	app.alert("Daca an = 2024, atunci luna >= 5!");
	xfa.host.setFocus(this);
}
else utile.check_tipDecont();

// ===== #48  form1.Antet.metaDate.perioada.dataInceput  [exit]  (application/x-javascript)
// verific format data
if(this.rawValue == this.formattedValue){  
        xfa.host.messageBox("Ati introdus un format invalid pentru data. Utilizati calendarul sau introduceti data in formatul ZZ.LL.AAAA (ex. 19.10.2013).", "VALIDARE FORMAT DATA");  
        xfa.host.setFocus(this.somExpression);  
        this.rawValue = null;  
    }
// verific constrangeri
else{
	if( dataSfarsit.rawValue != null && this.rawValue != null)  {
  		 if (this.rawValue > dataSfarsit.rawValue){ 
   			app.alert("'Data sfarsit' < 'Data inceput'");
   			this.rawValue = null;
   		}
	}
	/*
	var v1 = this.rawValue;
	if (v1 != null){
		v1 = schData.DT(v1.toString()).substr(6,4);
		var anR = IdDoc.an_r.rawValue;
		if (anR != null){
			if (v1 > anR){
				//app.alert("Acest camp se completează numai dacă activitatea inceteaza în cursul anului in care s-a realizat venitul declarat(" + (anR - 1) + ")!");
				app.alert("Anul din data documentului trebuie sa fie mai mic sau egal cu anul de raportare!");
				this.rawValue = "";}
			}
	
	*/
}

// ===== #49  form1.Antet.metaDate.perioada.dataSfarsit  [exit]  (application/x-javascript)
// verific format data
if(this.rawValue == this.formattedValue){  
        xfa.host.messageBox("Ati introdus un format invalid pentru data. Utilizati calendarul sau introduceti data in formatul ZZ.LL.AAAA (ex. 19.10.2013).", "VALIDARE FORMAT DATA");  
        xfa.host.setFocus(this.somExpression);  
        this.rawValue = null;  
    }
// verific constrangeri
else{
	if( dataInceput.rawValue != null && this.rawValue != null)  {
  		 if (this.rawValue < dataInceput.rawValue){ 
   			app.alert("'Data sfarsit contract' < 'Data inceput contract'");
   			this.rawValue = null;
   		}
	}
}

// ===== #50  form1.Antet.metaDate.d_rez  [mouseUp]  (application/x-javascript)
if (this.rawValue == 0)this.caption.font.weight = "normal";
if (this.rawValue == 1)this.caption.font.weight = "bold";

// ===== #51  form1.Antet.metaDate.d_rez  [initialize]  (application/x-javascript)
if (this.rawValue == 0)this.caption.font.weight = "normal";
if (this.rawValue == 1)this.caption.font.weight = "bold";

// ===== #52  form1.Antet.metaDate.d_rez  [change]  (application/x-javascript)
if (this.rawValue == 0){
	temeiLegal.selectedIndex = -1;
	temeiLegal.mandatory = "disabled";
}
else {
	temeiLegal.mandatory = "error";
	temeiLegal.rawValue = 2;
	}

// ===== #53  form1.Antet.metaDate.d_scc  [mouseUp]  (application/x-javascript)
if (this.rawValue == 0)this.caption.font.weight = "normal";
if (this.rawValue == 1)this.caption.font.weight = "bold";

// ===== #54  form1.Antet.metaDate.d_scc  [initialize]  (application/x-javascript)
if (this.rawValue == 0)this.caption.font.weight = "normal";
if (this.rawValue == 1)this.caption.font.weight = "bold";

// ===== #55  form1.Antet.metaDate.d_scc  [change]  (application/x-javascript)
if (this.rawValue == 0){
	cifS.rawValue = "";
	cifS.mandatory = "disabled";
}
else cifS.mandatory = "error";

// ===== #56  form1.Antet.metaDate.d_rec  [mouseUp]  (application/x-javascript)
if (this.rawValue == 0)this.caption.font.weight = "normal";
if (this.rawValue == 1)this.caption.font.weight = "bold";

// ===== #57  form1.Antet.metaDate.d_rec  [initialize]  (application/x-javascript)
if (this.rawValue == 0)this.caption.font.weight = "normal";
if (this.rawValue == 1)this.caption.font.weight = "bold";

// ===== #58  form1.Antet.temeiLegal  [ready]  (application/x-javascript)


// ===== #59  form1.Antet.temeiLegal  [enter]  (application/x-javascript)
if (metaDate.d_rez.rawValue == 0){
	var mesaj = "Mai intai trebuie sa activati casuta 'Declaratie depusa dupa anularea rezervei verificarii ulterioare'!";
	xfa.host.messageBox(mesaj,"Conditie prealabila", 1);
	xfa.host.setFocus(metaDate.d_rez);
}

// ===== #60  form1.Antet.temeiLegal  [exit]  (application/x-javascript)
if (metaDate.d_rez.rawValue == 1) this.rawValue = 2;
if (this.rawValue == 1) this.rawValue = 2;
//else this.selectedIndex = -1;

// ===== #61  form1.Antet.cifS  [exit]  (application/x-javascript)
var fieldValue = this.rawValue;
if (fieldValue != null){
	var noSp = utile.trimSpaces(fieldValue);//scot fieldValue stg/dr
	this.rawValue = noSp;
	var n = this.rawValue.length;
	if ( n <= 10 ){// este CUI
		var test = valid.isCUI( this.rawValue );
		if(test  == false){		
			app.alert("Cod de identificare fiscală(CUI) invalid!\n\nTrebuie sa introduceti un cod de identificare valid.");
			xfa.host.setFocus(this);
		}
	}
	else if ( n <= 13){ // este CNP sau NIF
		var test = valid.isCnpNif( this.rawValue );
		if(test  == false){		
			app.alert("Cod de identificare fiscală(CNP sau NIF) invalid!\n\nTrebuie sa introduceti un cod de identificare valid.");
			xfa.host.setFocus(this);
		}
	}
}

// ===== #62  form1.Antet.cifS  [change]  (application/x-javascript)
if (xfa.event.newText.match(/[^0-9 ]/)){
	app.alert("Trebuie sa introduceti numai caractere numerice!");
	xfa.event.change = "";
}

// ===== #63  form1.Antet.cifS  [ready]  (application/x-javascript)


// ===== #64  form1.Antet.cifS  [enter]  (application/x-javascript)
if (metaDate.d_scc.rawValue == 0){
	var mesaj = "Mai intai trebuie sa activati casuta 'Declarație depusă potrivit art.90 alin.(4) din Legea nr.207/2015 privind Codul de procedură fiscală'!";
	xfa.host.messageBox(mesaj,"Conditie prealabila", 1);
	xfa.host.setFocus(metaDate.d_scc);
}

// ===== #65  form1.Antet.d_reprezentant  [mouseUp]  (application/x-javascript)
if (this.rawValue == 0)this.caption.font.weight = "normal";
if (this.rawValue == 1)this.caption.font.weight = "bold";

// ===== #66  form1.Antet.d_reprezentant  [initialize]  (application/x-javascript)
if (this.rawValue == 0)this.caption.font.weight = "normal";
if (this.rawValue == 1)this.caption.font.weight = "bold";

// ===== #67  form1.identifCntr.denumire.den  [exit]  (application/x-javascript)
var fieldValue = this.rawValue;
if (fieldValue !== null){
	var noSp = utile.trimSpaces(fieldValue);//scot spatii stg/dr
	this.rawValue = noSp;
	//verific caractere nepermise
	var rgx = /[^0-9a-zA-Z,.\-& ]/g;
	var res = utile.invalidChr(this.rawValue, rgx);
	if (res != null) {
		app.alert ("Ati introdus caracterele nepermise: " + res + "\nEliminati caracterele indicate si continuati completarea formularului.\n\nIntroduceti text fara caractere speciale. Puteti sa folositi literele alfabetului latin (A-Z, a-z), cifrele arabe (0-9), semnul virgula (,), semnul punct (.), semnul minus (-), semnul ampersand (&) si spatii ( )." );
		xfa.host.setFocus(this);
	}
}

// ===== #68  form1.identifCntr.denumire.den  [change]  (application/x-javascript)
xfa.event.change = xfa.event.change.toUpperCase();

// ===== #69  form1.identifCntr.denumire.den  [ready]  (application/x-javascript)


// ===== #70  form1.identifCntr.denumire.cif  [exit]  (application/x-javascript)
var fieldValue = this.rawValue;
if (fieldValue != null){
	var noSp = utile.trimSpaces(fieldValue);//scot fieldValue stg/dr
	this.rawValue = noSp;
	var n = this.rawValue.length;
	if ( n <= 10 ){// este CUI
		var test = valid.isCUI( this.rawValue );
		if(test  == false){		
			app.alert("Cod de identificare fiscală(CUI) invalid!\n\nTrebuie sa introduceti un cod de identificare valid.");
			xfa.host.setFocus(this);
		}
	}
	else if ( n <= 13){ // este CNP sau NIF
		var test = valid.isCnpNif( this.rawValue );
		if(test  == false){		
			app.alert("Cod de identificare fiscală(CNP sau NIF) invalid!\n\nTrebuie sa introduceti un cod de identificare valid.");
			xfa.host.setFocus(this);
		}
	}
}

// ===== #71  form1.identifCntr.denumire.cif  [change]  (application/x-javascript)
if (xfa.event.newText.match(/[^0-9 ]/)){
	app.alert("Trebuie sa introduceti numai caractere numerice!");
	xfa.event.change = "";
}

// ===== #72  form1.identifCntr.denumire.cif  [ready]  (application/x-javascript)


// ===== #73  form1.identifCntr.adresa.str  [exit]  (application/x-javascript)
var fieldValue = this.rawValue;
if (fieldValue !== null){
	var noSp = utile.trimSpaces(fieldValue);//scot spatii stg/dr
	this.rawValue = noSp;
	//verific caractere nepermise
	var rgx = /[^0-9a-zA-Z,.\-+ ]/g;
	var res = utile.invalidChr(this.rawValue, rgx);
	if (res != null) {
		app.alert ("Ati introdus caracterele nepermise: " + res + "\nEliminati caracterele indicate si continuati completarea formularului.\n\nIntroduceti text fara caractere speciale. Puteti sa folositi literele alfabetului latin (A-Z, a-z), cifrele arabe (0-9), semnul virgula (,), semnul punct (.), semnul minus (-), semnul plus (+) si spatii ( )." );
		xfa.host.setFocus(this);
	}
}

// ===== #74  form1.identifCntr.adresa.str  [change]  (application/x-javascript)
xfa.event.change=xfa.event.change.toUpperCase();

// ===== #75  form1.identifCntr.adresa.str  [ready]  (application/x-javascript)


// ===== #76  form1.identifCntr.adresa.nr  [exit]  (application/x-javascript)
var fieldValue = this.rawValue;
if (fieldValue !== null){
	var noSp = utile.trimSpaces(fieldValue);//scot spatii stg/dr
	this.rawValue = noSp;
	//verific caractere nepermise
	var rgx = /[^0-9a-zA-Z,.\-+ ]/g;
	var res = utile.invalidChr(this.rawValue, rgx);
	if (res != null) {
		app.alert ("Ati introdus caracterele nepermise: " + res + "\nEliminati caracterele indicate si continuati completarea formularului.\n\nIntroduceti text fara caractere speciale. Puteti sa folositi literele alfabetului latin (A-Z, a-z), cifrele arabe (0-9), semnul virgula (,), semnul punct (.), semnul minus (-), semnul plus (+) si spatii ( )." );
		xfa.host.setFocus(this);
	}
}

// ===== #77  form1.identifCntr.adresa.nr  [change]  (application/x-javascript)
/*if (xfa.event.newText.match(/[^0-9 ]/)){
xfa.event.change = "";
}
*/
xfa.event.change=xfa.event.change.toUpperCase();

// ===== #78  form1.identifCntr.adresa.nr  [enter]  (application/x-javascript)
//this.ui.oneOfChild.border.fill.color.value = "160,210,10";// changes the fill colour

// ===== #79  form1.identifCntr.adresa.nr  [ready]  (application/x-javascript)


// ===== #80  form1.identifCntr.adresa.loc  [exit]  (application/x-javascript)
var fieldValue = this.rawValue;
if (fieldValue !== null){
	var noSp = utile.trimSpaces(fieldValue);//scot spatii stg/dr
	this.rawValue = noSp;
	//verific caractere nepermise
	var rgx = /[^0-9a-zA-Z,.\-+ ]/g;
	var res = utile.invalidChr(this.rawValue, rgx);
	if (res != null) {
		app.alert ("Ati introdus caracterele nepermise: " + res + "\nEliminati caracterele indicate si continuati completarea formularului.\n\nIntroduceti text fara caractere speciale. Puteti sa folositi literele alfabetului latin (A-Z, a-z), cifrele arabe (0-9), semnul virgula (,), semnul punct (.), semnul minus (-), semnul plus (+) si spatii ( )." );
		xfa.host.setFocus(this);
	}
}

// ===== #81  form1.identifCntr.adresa.loc  [change]  (application/x-javascript)
xfa.event.change=xfa.event.change.toUpperCase();

// ===== #82  form1.identifCntr.adresa.loc  [enter]  (application/x-javascript)
//this.ui.oneOfChild.border.fill.color.value = "160,210,10";// changes the fill colour
if (judet.rawValue == null){
app.alert(" Mai intai, trebuie sa completati campul Judet!"); 
xfa.host.setFocus(judet);
}

// ===== #83  form1.identifCntr.adresa.loc  [ready]  (application/x-javascript)


// ===== #84  form1.identifCntr.adresa.judet  [docReady]  (application/x-javascript)
/*if (this.rawValue === null)
{
	jud.ui.picture.value = "text{OOOOOOOOOO}";
	jud.format.picture.value = "text{'Selectează'}";
}
*/

// ===== #85  form1.identifCntr.adresa.judet  [enter]  (application/x-javascript)
xfa.host.openList(this);

// ===== #86  form1.identifCntr.adresa.judet  [exit]  (application/x-javascript)
// Filteaza	lista dupa valoarea introdusa de la tastatura
// Check that the user has not typed in a value 
// that does not exist in the list. If they have
// then clear the dropdown. 

// First create an array of the items in the 
// dropdown list.
var vUserInput = [];
for (var i=0; i<this.length; i++) {
	vUserInput.push(this.getDisplayItem(i));
}

// Get the selected display value
var vChoice = this.selectedIndex; 
var j = this.getDisplayItem(vChoice); 

// Check that the value is not in the array
if (this.rawValue !== null && vUserInput.lastIndexOf(j) === -1) {
	this.rawValue = null; // clear the dropdown
	//this.ui.oneOfChild.border.fill.color.value = "255,225,225"; //coloreaza in rosu
	xfa.host.beep("3"); // audio alert to the user
		app.alert("Valoarea introdusa nu exista in nomenclator!\n\nReluati introducerea datelor...");
		xfa.host.setFocus(this);
}


if (this.rawValue == 40){
	loc.rawValue = "BUCURESTI";
	//this.parent.sect.presence = "visible";
	sect.access = "open";
	//sect.mandatory = 'error';
	//sect.ui.oneOfChild.border.fill.color.value = "255,255,255";
	}
else{
	sect.access = "readOnly";
	//sect.mandatory = 'disabled';
	sect.selectedIndex = -1;
	sect.rawValue = "";
	//sect.ui.oneOfChild.border.fill.color.value = "255,255,204";
}

// ===== #87  form1.identifCntr.adresa.judet  [change]  (application/x-javascript)
var oValue = xfa.event.prevText;
var nValue = xfa.event.newText;
if (oValue !== nValue) loc.rawValue = "";

// if Control is held, clear selection
if (xfa.event.modifier){
	xfa.event.change = "";
}

// ===== #88  form1.identifCntr.adresa.judet  [ready]  (application/x-javascript)


// ===== #89  form1.identifCntr.adresa.sect  [docReady]  (application/x-javascript)
/*if (this.rawValue === null)
{
	sect.ui.picture.value = "text{OOOOOOOOOOOOOOOOOOOOOOOOO}";
	sect.format.picture.value = "text{'Exclusiv pentru Bucuresti'}";
}*/

// ===== #90  form1.identifCntr.adresa.sect  [enter]  (application/x-javascript)
//if (judet_P.rawValue == 40) this.ui.oneOfChild.border.fill.color.value = "160,210,10";// changes the fill colour
// seteaza formatarea implicita a textului pentru afisarea valorii campului
//this.font.posture = "normal";
//this.font.weight = "normal";
//this.font.fill.color.value = "0,0,0";
//xfa.host.openList(this);

// ===== #91  form1.identifCntr.adresa.sect  [exit]  (application/x-javascript)
//if (judet_P.rawValue == 40)this.ui.oneOfChild.border.fill.color.value = "255,255,255";// changes the fill colour

// ===== #92  form1.identifCntr.adresa.sect  [change]  (application/x-javascript)
//xfa.event.change = xfa.event.change.toUpperCase();

// ===== #93  form1.identifCntr.adresa.sect  [ready]  (application/x-javascript)


// ===== #94  form1.identifCntr.adresa.bloc  [exit]  (application/x-javascript)
var fieldValue = this.rawValue;
if (fieldValue !== null){
	var noSp = utile.trimSpaces(fieldValue);//scot spatii stg/dr
	this.rawValue = noSp;
	//verific caractere nepermise
	var rgx = /[^0-9a-zA-Z,.\-+ ]/g;
	var res = utile.invalidChr(this.rawValue, rgx);
	if (res != null) {
		app.alert ("Ati introdus caracterele nepermise: " + res + "\nEliminati caracterele indicate si continuati completarea formularului.\n\nIntroduceti text fara caractere speciale. Puteti sa folositi literele alfabetului latin (A-Z, a-z), cifrele arabe (0-9), semnul virgula (,), semnul punct (.), semnul minus (-), semnul plus (+) si spatii ( )." );
		xfa.host.setFocus(this);
	}
}

// ===== #95  form1.identifCntr.adresa.bloc  [change]  (application/x-javascript)
xfa.event.change = xfa.event.change.toUpperCase();

// ===== #96  form1.identifCntr.adresa.bloc  [enter]  (application/x-javascript)
//this.ui.oneOfChild.border.fill.color.value = "160,210,10";// changes the fill colour

// ===== #97  form1.identifCntr.adresa.bloc  [ready]  (application/x-javascript)


// ===== #98  form1.identifCntr.adresa.scara  [exit]  (application/x-javascript)
var fieldValue = this.rawValue;
if (fieldValue !== null){
	var noSp = utile.trimSpaces(fieldValue);//scot spatii stg/dr
	this.rawValue = noSp;
	//verific caractere nepermise
	var rgx = /[^0-9a-zA-Z,.\-+ ]/g;
	var res = utile.invalidChr(this.rawValue, rgx);
	if (res != null) {
		app.alert ("Ati introdus caracterele nepermise: " + res + "\nEliminati caracterele indicate si continuati completarea formularului.\n\nIntroduceti text fara caractere speciale. Puteti sa folositi literele alfabetului latin (A-Z, a-z), cifrele arabe (0-9), semnul virgula (,), semnul punct (.), semnul minus (-), semnul plus (+) si spatii ( )." );
		xfa.host.setFocus(this);
	}
}

// ===== #99  form1.identifCntr.adresa.scara  [change]  (application/x-javascript)
xfa.event.change = xfa.event.change.toUpperCase();

// ===== #100  form1.identifCntr.adresa.scara  [enter]  (application/x-javascript)
//this.ui.oneOfChild.border.fill.color.value = "160,210,10";// changes the fill colour

// ===== #101  form1.identifCntr.adresa.scara  [ready]  (application/x-javascript)


// ===== #102  form1.identifCntr.adresa.etaj  [exit]  (application/x-javascript)
var fieldValue = this.rawValue;
if (fieldValue !== null){
	var noSp = utile.trimSpaces(fieldValue);//scot spatii stg/dr
	this.rawValue = noSp;
	//verific caractere nepermise
	var rgx = /[^0-9a-zA-Z,.\-+ ]/g;
	var res = utile.invalidChr(this.rawValue, rgx);
	if (res != null) {
		app.alert ("Ati introdus caracterele nepermise: " + res + "\nEliminati caracterele indicate si continuati completarea formularului.\n\nIntroduceti text fara caractere speciale. Puteti sa folositi literele alfabetului latin (A-Z, a-z), cifrele arabe (0-9), semnul virgula (,), semnul punct (.), semnul minus (-), semnul plus (+) si spatii ( )." );
		xfa.host.setFocus(this);
	}
}

// ===== #103  form1.identifCntr.adresa.etaj  [change]  (application/x-javascript)
xfa.event.change = xfa.event.change.toUpperCase();

// ===== #104  form1.identifCntr.adresa.etaj  [enter]  (application/x-javascript)
//this.ui.oneOfChild.border.fill.color.value = "160,210,10";// changes the fill colour

// ===== #105  form1.identifCntr.adresa.etaj  [ready]  (application/x-javascript)


// ===== #106  form1.identifCntr.adresa.apt  [exit]  (application/x-javascript)
var fieldValue = this.rawValue;
if (fieldValue !== null){
	var noSp = utile.trimSpaces(fieldValue);//scot spatii stg/dr
	this.rawValue = noSp;
	//verific caractere nepermise
	var rgx = /[^0-9a-zA-Z,.\-+ ]/g;
	var res = utile.invalidChr(this.rawValue, rgx);
	if (res != null) {
		app.alert ("Ati introdus caracterele nepermise: " + res + "\nEliminati caracterele indicate si continuati completarea formularului.\n\nIntroduceti text fara caractere speciale. Puteti sa folositi literele alfabetului latin (A-Z, a-z), cifrele arabe (0-9), semnul virgula (,), semnul punct (.), semnul minus (-), semnul plus (+) si spatii ( )." );
		xfa.host.setFocus(this);
	}
}

// ===== #107  form1.identifCntr.adresa.apt  [change]  (application/x-javascript)
xfa.event.change = xfa.event.change.toUpperCase();

// ===== #108  form1.identifCntr.adresa.apt  [enter]  (application/x-javascript)
//this.ui.oneOfChild.border.fill.color.value = "160,210,10";// changes the fill colour

// ===== #109  form1.identifCntr.adresa.apt  [ready]  (application/x-javascript)


// ===== #110  form1.identifCntr.adresa.codPst  [exit]  (application/x-javascript)
var fieldValue = this.rawValue;
if (fieldValue !== null){
	var noSp = utile.trimSpaces(fieldValue);//scot spatii stg/dr
	this.rawValue = noSp;
	//verific caractere nepermise
	var rgx = /[^0-9a-zA-Z,.\-+ ]/g;
	var res = utile.invalidChr(this.rawValue, rgx);
	if (res != null) {
		app.alert ("Ati introdus caracterele nepermise: " + res + "\nEliminati caracterele indicate si continuati completarea formularului.\n\nIntroduceti text fara caractere speciale. Puteti sa folositi literele alfabetului latin (A-Z, a-z), cifrele arabe (0-9), semnul virgula (,), semnul punct (.), semnul minus (-), semnul plus (+) si spatii ( )." );
		xfa.host.setFocus(this);
	}
	if (this.rawValue.length != 6){
		var mesaj = "Trebuie sa introduceti 6(sase) caractere numerice!";
		xfa.host.messageBox(mesaj,"Format eronat", 0);
		xfa.host.setFocus(this);
	}
}

// ===== #111  form1.identifCntr.adresa.codPst  [change]  (application/x-javascript)
if (xfa.event.newText.match(/[^0-9 ]/)){
	var mesaj = "Trebuie sa introduceti numai caractere numerice!";
	xfa.host.messageBox(mesaj,"Format eronat", 0);
	xfa.event.change = "";
}

// ===== #112  form1.identifCntr.adresa.codPst  [enter]  (application/x-javascript)
//this.ui.oneOfChild.border.fill.color.value = "160,210,10";// changes the fill colour

// ===== #113  form1.identifCntr.adresa.codPst  [ready]  (application/x-javascript)


// ===== #114  form1.identifCntr.adresa  [ready]  (application/x-javascript)


// ===== #115  form1.identifCntr.contact.telefon  [exit]  (application/x-javascript)
var sir = this.rawValue;
if (sir != null){
	var regTel = /^(?:(?:(?:00\s?|\+)40\s?|0)(?:7\d{2}\s?\d{3}\s?\d{3}|(21|31)\d{1}\s?\d{3}\s?\d{3}|((2|3)[3-7]\d{1})\s?\d{3}\s?\d{3}|(8|9)0\d{1}\s?\d{3}\s?\d{3}))$/;
	var check = regTel.test(sir);
	if (check == false){
		app.alert("Trebuie sa introduceti o valoare corecta pentru telefon! \nDe exemplu 0211234567");
		xfa.host.setFocus(this);
	}
}

// ===== #116  form1.identifCntr.contact.telefon  [change]  (application/x-javascript)
if (xfa.event.newText.match(/[^0-9 ]/)){
	app.alert("Trebuie sa introduceti numai caractere numerice!");
	xfa.event.change = "";
}

// ===== #117  form1.identifCntr.contact.telefon  [enter]  (application/x-javascript)
//this.ui.oneOfChild.border.fill.color.value = "160,210,10";// changes the fill colour

// ===== #118  form1.identifCntr.contact.telefon  [ready]  (application/x-javascript)


// ===== #119  form1.identifCntr.contact.fax  [exit]  (application/x-javascript)
var sir = this.rawValue;
if (sir != null){
	var regTel = /^(?:(?:(?:00\s?|\+)40\s?|0)(?:7\d{2}\s?\d{3}\s?\d{3}|(21|31)\d{1}\s?\d{3}\s?\d{3}|((2|3)[3-7]\d{1})\s?\d{3}\s?\d{3}|(8|9)0\d{1}\s?\d{3}\s?\d{3}))$/;
	var check = regTel.test(sir);
	if (check == false){
		app.alert("Trebuie sa introduceti o valoare corecta pentru telefon! \nDe exemplu 0211234567");
		xfa.host.setFocus(this);
	}
}

// ===== #120  form1.identifCntr.contact.fax  [change]  (application/x-javascript)
if (xfa.event.newText.match(/[^0-9 ]/)){
	app.alert("Trebuie sa introduceti numai caractere numerice!");
	xfa.event.change = "";
}

// ===== #121  form1.identifCntr.contact.fax  [enter]  (application/x-javascript)
//this.ui.oneOfChild.border.fill.color.value = "160,210,10";// changes the fill colour

// ===== #122  form1.identifCntr.contact.fax  [ready]  (application/x-javascript)


// ===== #123  form1.identifCntr.contact.email  [exit]  (application/x-javascript)
//validare format adresa de email
var err = 0;
var mesaj = "Nu aţi introdus un format valid pentru email!\
\n \
\nAcest câmp opţional trebuie să includă o adresă de e-mail validă la care să puteţi fi contactat.\
\n \
\nO adresa de e-mail are forma: [utilizator]@[domeniu].[TLD].De exemplu: nume.contribuabil@nume.domeniu.ro\
\n \
\nLimita maximă pentru acest câmp este de 200 de caractere. Nu introduceti spatii.";
if(this.rawValue!=null){
	var reg = new RegExp("^([a-zA-Z0-9]+([_.-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*([.][a-zA-Z]{2,4})+)$");
	if(!reg.test(this.rawValue)){
		xfa.host.messageBox(mesaj);
		var err = 1;
	}
}
if (err == 1){
	this.rawValue = "";
	xfa.host.setFocus(this);
 }

// ===== #124  form1.identifCntr.contact.email  [ready]  (application/x-javascript)


// ===== #125  form1.identifCntr.banca.den  [exit]  (application/x-javascript)
var fieldValue = this.rawValue;
if (fieldValue !== null){
	var noSp = utile.trimSpaces(fieldValue);//scot spatii stg/dr
	this.rawValue = noSp;
	//verific caractere nepermise
	var rgx = /[^0-9a-zA-Z,.\-& ]/g;
	var res = utile.invalidChr(this.rawValue, rgx);
	if (res != null) {
		app.alert ("Ati introdus caracterele nepermise: " + res + "\nEliminati caracterele indicate si continuati completarea formularului.\n\nIntroduceti text fara caractere speciale. Puteti sa folositi literele alfabetului latin (A-Z, a-z), cifrele arabe (0-9), semnul virgula (,), semnul punct (.), semnul minus (-), semnul ampersand (&) si spatii ( )." );
		xfa.host.setFocus(this);
	}
}

// ===== #126  form1.identifCntr.banca.den  [change]  (application/x-javascript)
xfa.event.change = xfa.event.change.toUpperCase();

// ===== #127  form1.identifCntr.banca.den  [ready]  (application/x-javascript)


// ===== #128  form1.identifCntr.banca.iban  [exit]  (application/x-javascript)
function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

//scot spatii stg/dr
var spatii = this.rawValue;
if (spatii != null){
	spatii = spatii.replace(/ /g,'');//scot spatii global
	var noSp = utile.remSpaces(spatii);
	//if (noSp.length != 24) {
	//xfa.host.setFocus(this); 
	//app.alert("Trebuie sa introduceti 24 de caractere fara spatii!")
//}
/*else*/ this.rawValue = noSp;
}


// validare IBAN
 var CODE = [
		"AL", "BY", "TL", "GE", "XK", "VG", "LC", "ST",
        "AD", "AE", "AT", "AZ", "BA", "BE", "BG", "BH", "BR",
        "CH", "CR", "CY", "CZ", "DE", "DK", "DO", "EE", "ES",
        "FI", "FO", "FR", "GB", "GI", "GL", "GR", "GT", "HR",
        "HU", "IE", "IL", "IS", "IT", "JO", "KW", "KZ", "LB",
        "LI", "LT", "LU", "LV", "MC", "MD", "ME", "MK", "MR",
        "MT", "MU", "NL", "NO", "PK", "PL", "PS", "PT", "QA",
        "RO", "RS", "SA", "SE", "SI", "SK", "SM", "TN", "TR"
    ];
var fieldValue = this.rawValue;
if (fieldValue != null){
	var countryCode = fieldValue.substring(0, 2); 
	var isISO = isInArray(countryCode, CODE); 
	if (isISO == true){
		var err = valid.isValidIBANNumber(fieldValue);
		if (err == false){
			app.alert('Validare lungime si sintaxa:\n\nEROARE - Cont bancar(IBAN) invalid!');
			xfa.host.setFocus(this);
		}
		if (err > 1){
			app.alert('Validare cifra de control:\n\nEROARE - Cont bancar(IBAN) invalid!');
			xfa.host.setFocus(this);
		}
	}	
}

// ===== #129  form1.identifCntr.banca.iban  [change]  (application/x-javascript)
xfa.event.change = xfa.event.change.toUpperCase();

// ===== #130  form1.identifCntr.banca.iban  [initialize]  (application/x-javascript)


// ===== #131  form1.identifCntr.caen  [exit]  (application/x-javascript)
if ( this.parent.caen1.rawValue != null && this.parent.caen1.rawValue != "") this.parent.caen1.rawValue = null;

// ===== #132  form1.identifCntr.caen1  [exit]  (application/x-javascript)
if ( this.parent.caen.rawValue != null && this.parent.caen.rawValue != "") this.parent.caen.rawValue = null;

// ===== #133  form1.identifCntr.proRata  [validate]  (application/x-javascript)
if (!(this.rawValue != null && (this.rawValue >= 0 && this.rawValue <= 100))){
  app.alert("Pro-rata de deducere trebuie sa fie >= 0 si <= 100");
  this.rawValue = 100; 
}

// ===== #134  form1.date.comert.r7_1.c2  [exit]  (application/x-javascript)
var lt = this.rawValue;
var gt = r7.c2.rawValue;
var tva = c3.rawValue;

/*
if (lt != null && gt!= null){
	if (Math.abs(lt) > Math.abs(gt)) {app.alert("Rd.7.1 col.1 nu poate fi mai mare decat rd.7 col.1!"); this.rawValue = null;}
}

if (lt != null && tva != null){
	if (Number(lt) <= Number(tva)) {app.alert("Rd.7.1 col.1 nu poate fi mai mic sau egal cu rd.7.1 col.2!"); this.rawValue = null;}
}
*/
/*
var lt = Number(this.rawValue);
var gt = Number(r7.c2.rawValue);
var tva = Number(c3.rawValue);

if (!isNaN(lt) && !isNaN(gt)) {
  if (lt > gt) {
    app.alert("Rd.7.1 col.1 nu poate fi mai mare decât rd.7 col.1!");
    this.rawValue = null;
  }
}

if (!isNaN(lt) && !isNaN(tva)) {
  if (lt <= tva) {
    app.alert("Rd.7.1 col.1 nu poate fi mai mic sau egal cu rd.7.1 col.2!");
    this.rawValue = null;
  }
}
*/

// ===== #135  form1.date.comert.r7_1.c3  [exit]  (application/x-javascript)
var lt = c2.rawValue;
var tva = this.rawValue;

/*
if (lt != null && tva != null){
	if (Math.abs(lt) <= Math.abs(tva)) {app.alert("Rd.7.1 col.2 nu poate fi mai mare sau egal cu rd.7.1 col.1!"); this.rawValue = null;}
}
*/

// ===== #136  form1.date.livrari.r9.c2  [exit]  (application/x-javascript)
if (this.rawValue != "" || this.rawValue != null) {
 	c3.rawValue = utile.roundNumber(this.rawValue * 0.21, 0);
}

// ===== #137  form1.date.livrari.r9.c3  [calculate]  (application/x-javascript)
if (c2.rawValue == null)this.rawValue = null;

// ===== #138  form1.date.livrari.r9.c3  [exit]  (application/x-javascript)
var vv = Math.abs(c2.rawValue);
var vv1 = utile.roundNumber(vv * 0.20, 0);
var vv2 = utile.roundNumber(vv * 0.21, 0);
var vv3 = utile.roundNumber(vv * 0.22, 0);
if (this.rawValue != null || this.rawValue != ''){
  if ((vv1 > Math.abs(this.rawValue)) || (Math.abs(this.rawValue) > vv3)){ 
     //xfa.host.messageBox("ATENTIE!\n\nSuma introdusă(" + this.rawValue + ") diferă substanţial fată de cea calculată automat(" + vv2 + ")!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     xfa.host.messageBox("ATENTIE!\n\nSuma introdusă diferă substanţial fată de cea calculată automat!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     }
}

// ===== #139  form1.date.livrari.r10.c2  [exit]  (application/x-javascript)
if (this.rawValue != "" || this.rawValue != null) {
 	c3.rawValue = utile.roundNumber(this.rawValue * 0.11, 0);
}

// ===== #140  form1.date.livrari.r10.c3  [exit]  (application/x-javascript)
var vv = Math.abs(c2.rawValue);
var vv1 = utile.roundNumber(vv * 0.10, 0);
var vv2 = utile.roundNumber(vv * 0.11, 0);
var vv3 = utile.roundNumber(vv * 0.12, 0);
if (this.rawValue != null || this.rawValue != ''){
  if ((vv1 > Math.abs(this.rawValue)) || (Math.abs(this.rawValue) > vv3)) { 
     //xfa.host.messageBox("ATENTIE!\n\nSuma introdusă(" + this.rawValue + ") diferă substanţial fată de cea calculată automat(" + vv2 + ")!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     xfa.host.messageBox("ATENTIE!\n\nSuma introdusă diferă substanţial fată de cea calculată automat!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     }
}

// ===== #141  form1.date.livrari.r10.c3  [calculate]  (application/x-javascript)
if (c2.rawValue == null)this.rawValue = null;

// ===== #142  form1.date.livrari.r11.c2  [exit]  (application/x-javascript)
if (this.rawValue != "" || this.rawValue != null) {
 	c3.rawValue = utile.roundNumber(this.rawValue * 0.09, 0);
}

// ===== #143  form1.date.livrari.r11.c3  [exit]  (application/x-javascript)
var vv = Math.abs(c2.rawValue);
var vv1 = utile.roundNumber(vv * 0.08, 0);
var vv2 = utile.roundNumber(vv * 0.09, 0);
var vv3 = utile.roundNumber(vv * 0.10, 0);
if (this.rawValue != null || this.rawValue != ''){
  if ((vv1 > Math.abs(this.rawValue)) || (Math.abs(this.rawValue) > vv3)) { 
     xfa.host.messageBox("ATENTIE!\n\nSuma introdusă diferă substanţial fată de cea calculată automat!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     //xfa.host.messageBox("ATENTIE!\n\nSuma introdusă(" + this.rawValue + ") diferă substanţial fată de cea calculată automat(" + vv2 + ")!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     }
}

// ===== #144  form1.date.livrari.r11.c3  [calculate]  (application/x-javascript)
if (c2.rawValue == null)this.rawValue = null;

// ===== #145  form1.date.livrari.r12.c2  [validate]  (application/x-javascript)
/*var v12 = this.rawValue;
if (v12 < 0) v12 = -1 * v12;

var v19 = r12_1.c2.rawValue;
if (v19 < 0) v19 = -1 * v19;

var v9 = r12_2.c2.rawValue;
if (v9 < 0) v9 = -1 * v9;


var check = v19 + v9 ;
if ((this.rawValue != null || this.rawValue != '') && v12 < check){
	app.alert("EROARE!\nIn coloana Valoare:\n\nRd.12(" + this.rawValue + ") < Rd12.1 + Rd12.2 (" + check + ")!")
	xfa.host.setFocus(this);
	this.rawValue = '';
}
*/

// ===== #146  form1.date.livrari.r12.c2  [calculate]  (formcalc?)
$ = r12_1.c2 + r12_2.c2

// ===== #147  form1.date.livrari.r12.c3  [validate]  (application/x-javascript)
/*var v19 = r12_1.c3.rawValue;
var v9 = r12_2.c3.rawValue;

var check = v19 + v9 ;
if (this.rawValue < check){
	app.alert("EROARE!\nIn coloana TVA:\n\nRd.12(" + this.rawValue + ") < Rd12.1 + Rd12.2 (" + check + ")!")
	xfa.host.setFocus(this);
	this.rawValue = '';
}
*/

// ===== #148  form1.date.livrari.r12.c3  [calculate]  (formcalc?)
$ = r12_1.c3 + r12_2.c3

// ===== #149  form1.date.livrari.r12_1.c2  [exit]  (application/x-javascript)
if (this.rawValue != "" || this.rawValue != null) {
 	c3.rawValue = utile.roundNumber(this.rawValue * 0.21, 0);
}

// ===== #150  form1.date.livrari.r12_1.c2  [enter]  (application/x-javascript)
/*if (r12.c2.rawValue == null){
	app.alert("Mai ntai trebuie sa completati randul 12 col.Valoare!");
	xfa.host.setFocus(r12.c2);
}
*/

// ===== #151  form1.date.livrari.r12_1.c3  [calculate]  (application/x-javascript)
if (c2.rawValue == null)this.rawValue = null;

// ===== #152  form1.date.livrari.r12_1.c3  [exit]  (application/x-javascript)
var vv = Math.abs(c2.rawValue);
if (vv != null || vv != ''){
var vv1 = utile.roundNumber(vv * 0.20, 0);
var vv2 = utile.roundNumber(vv * 0.21, 0);
var vv3 = utile.roundNumber(vv * 0.22, 0);
if (this.rawValue != null || this.rawValue != ''){
  if ((vv1 > Math.abs(this.rawValue)) || (Math.abs(this.rawValue) > vv3)) { 
          xfa.host.messageBox("ATENTIE!\n\nSuma introdusă diferă substanţial fată de cea calculată automat!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     //xfa.host.messageBox("ATENTIE!\n\nSuma introdusă in Rd.12.3 col.TVA(" + this.rawValue + ") diferă substanţial fată de cea calculată automat(" + vv2 + ")!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     }
}
}

// ===== #153  form1.date.livrari.r12_1.c3  [enter]  (application/x-javascript)
/*if (r12.c3.rawValue == null){
	app.alert("Mai ntai trebuie sa completati randul 12 col.TVA!");
	xfa.host.setFocus(r12.c3);
}
*/

// ===== #154  form1.date.livrari.r12_2.c2  [exit]  (application/x-javascript)
if (this.rawValue != "" || this.rawValue != null) {
 	c3.rawValue = utile.roundNumber(this.rawValue * 0.11, 0);
}

// ===== #155  form1.date.livrari.r12_2.c2  [enter]  (application/x-javascript)
/*if (r12.c2.rawValue == null){
	app.alert("Mai ntai trebuie sa completati randul 12 col.Valoare!");
	xfa.host.setFocus(r12.c2);
}
*/

// ===== #156  form1.date.livrari.r12_2.c3  [calculate]  (application/x-javascript)
if (c2.rawValue == null)this.rawValue = null;

// ===== #157  form1.date.livrari.r12_2.c3  [exit]  (application/x-javascript)
var vv = Math.abs(c2.rawValue);
if (vv != null || vv != ''){
var vv1 = utile.roundNumber(vv * 0.10, 0);
var vv2 = utile.roundNumber(vv * 0.11, 0);
var vv3 = utile.roundNumber(vv * 0.12, 0);
if (this.rawValue != null || this.rawValue != ''){
  if ((vv1 > Math.abs(this.rawValue)) || (Math.abs(this.rawValue) > vv3)) { 
          xfa.host.messageBox("ATENTIE!\n\nSuma introdusă diferă substanţial fată de cea calculată automat!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     //xfa.host.messageBox("ATENTIE!\n\nSuma introdusă in Rd.12.3 col.TVA(" + this.rawValue + ") diferă substanţial fată de cea calculată automat(" + vv2 + ")!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     }
}
}

// ===== #158  form1.date.livrari.r12_2.c3  [enter]  (application/x-javascript)
/*if (r12.c3.rawValue == null){
	app.alert("Mai ntai trebuie sa completati randul 12 col.TVA!");
	xfa.host.setFocus(r12.c3);
}
*/

// ===== #159  form1.date.livrari.r17.c2  [exit]  (application/x-javascript)
/*
var lt = this.rawValue;
var tva = c3.rawValue;
if (lt != null && tva!= null){
	if (Number(lt) <= Number(tva)) {app.alert("Rd.17 col1. nu poate fi mai mic sau egal cu rd.17 col2.!"); this.rawValue = null;}
}
*/

// ===== #160  form1.date.livrari.r17.c3  [exit]  (application/x-javascript)
/*
var lt = c2.rawValue;
var tva = this.rawValue;
if (lt != null && tva!= null){
	if (Number(lt) <= Number(tva)) {app.alert("Rd.17 col2. nu poate fi mai mare sau egal cu rd.17 col1.!"); this.rawValue = null;}
}
*/

// ===== #161  form1.date.livrari.r19.c2  [calculate]  (formcalc?)
//$ =  comert.r1.c2 + comert.r2.c2 + comert.r3.c2 + comert.r4.c2 + comert.r5.c2 + comert.r6.c2 + comert.r7.c2 + comert.r8.c2 + r9.c2 + r10.c2 + r11.c2 + r12.c2 + r13.c2 + r14.c2 + r15.c2 + r16.c2 + r17.c2 + r18.c2 + r9_1.c2 + r10_1.c2 + r11_1.c2;
$ =  comert.r1.c2 + comert.r2.c2 + comert.r3.c2 + comert.r4.c2 + comert.r5.c2 + comert.r6.c2 + comert.r7.c2 + comert.r8.c2 + r9.c2  + r10.c2  + r11.c2  + r12.c2 + r13.c2 + r14.c2 + r15.c2 + r16.c2 + r17.c2 + r18.c2;
// R17_1 = R1_1+ R2_1+ R3_1+ R4_1+ R5_1+ R6_1+ R7_1+ R8_1+ R9_1+ R10_1+ R11_1+ R12_1+ R14_1+ R15_1+ R16_1+ R13_1 + R64_1 + R65_1 + R69_1 + R70_1 + R71_1

// ===== #162  form1.date.livrari.r19.c3  [calculate]  (formcalc?)
$ = comert.r5.c3 + comert.r6.c3 + comert.r7.c3 + comert.r8.c3 + r9.c3 + r10.c3 + r11.c3 + r12.c3 + r16.c3 + r17.c3 + r18.c3 ;

// R17_2 = R5_2+ R6_2+ R7_2+ R8_2+ R9_2+ R10_2+ R11_2+ R12_2 + R16_2 + R64_2 + R65_2 + R69_2 + R70_2 + R71_2

// ===== #163  form1.date.achizitiiRO.r20.c2  [calculate]  (formcalc?)
$ = comert.r5.c2

// ===== #164  form1.date.achizitiiRO.r20.c3  [calculate]  (formcalc?)
$ = comert.r5.c3

// ===== #165  form1.date.achizitiiRO.r20_1.c2  [calculate]  (formcalc?)
$ = comert.r5_1.c2

// ===== #166  form1.date.achizitiiRO.r20_1.c3  [calculate]  (formcalc?)
$ = comert.r5_1.c3

// ===== #167  form1.date.achizitiiRO.r21.c2  [calculate]  (formcalc?)
$ = comert.r6.c2

// ===== #168  form1.date.achizitiiRO.r21.c3  [calculate]  (formcalc?)
$ = comert.r6.c3

// ===== #169  form1.date.achizitiiRO.r22.c2  [calculate]  (formcalc?)
$ = comert.r7.c2

// ===== #170  form1.date.achizitiiRO.r22.c3  [calculate]  (formcalc?)
$ = comert.r7.c3

// ===== #171  form1.date.achizitiiRO.r22_1.c2  [calculate]  (formcalc?)
$ = comert.r7_1.c2

// ===== #172  form1.date.achizitiiRO.r22_1.c3  [calculate]  (formcalc?)
$ = comert.r7_1.c3

// ===== #173  form1.date.achizitiiRO.r23.c2  [calculate]  (formcalc?)
$ = comert.r8.c2

// ===== #174  form1.date.achizitiiRO.r23.c3  [calculate]  (formcalc?)
$ = comert.r8.c3

// ===== #175  form1.date.achizitiiIMP.r24.c2  [exit]  (application/x-javascript)
if (this.rawValue != "" || this.rawValue != null) {
 	c3.rawValue = utile.roundNumber(this.rawValue * 0.21, 0);
}

// ===== #176  form1.date.achizitiiIMP.r24.c3  [calculate]  (application/x-javascript)
if (c2.rawValue == null)this.rawValue = null;

// ===== #177  form1.date.achizitiiIMP.r24.c3  [exit]  (application/x-javascript)
var vv = Math.abs(c2.rawValue);
var vv1 = utile.roundNumber(vv * 0.20, 0);
var vv2 = utile.roundNumber(vv * 0.21, 0);
var vv3 = utile.roundNumber(vv * 0.22, 0);
if (this.rawValue != null || this.rawValue != ''){
  if ((vv1 > Math.abs(this.rawValue)) || (Math.abs(this.rawValue) > vv3)) { 
          xfa.host.messageBox("ATENTIE!\n\nSuma introdusă diferă substanţial fată de cea calculată automat!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     //xfa.host.messageBox("ATENTIE!\n\nSuma introdusă la Rd.24. col.TVA(" + this.rawValue + ") diferă substanţial fată de cea calculată automat(" + vv2 + ")!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     }
}

// ===== #178  form1.date.achizitiiIMP.r25.c2  [exit]  (application/x-javascript)
if (this.rawValue != "" || this.rawValue != null) {
 	c3.rawValue = utile.roundNumber(this.rawValue * 0.11, 0);
}

// ===== #179  form1.date.achizitiiIMP.r25.c3  [calculate]  (application/x-javascript)
if (c2.rawValue == null)this.rawValue = null;

// ===== #180  form1.date.achizitiiIMP.r25.c3  [exit]  (application/x-javascript)
var vv = Math.abs(c2.rawValue);
var vv1 = utile.roundNumber(vv * 0.10, 0);
var vv2 = utile.roundNumber(vv * 0.11, 0);
var vv3 = utile.roundNumber(vv * 0.12, 0);
if (this.rawValue != null || this.rawValue != ''){
  if ((vv1 > Math.abs(this.rawValue)) || (Math.abs(this.rawValue) > vv3)) { 
          xfa.host.messageBox("ATENTIE!\n\nSuma introdusă diferă substanţial fată de cea calculată automat!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     //xfa.host.messageBox("ATENTIE!\n\nSuma introdusă la Rd.25. col.TVA(" + this.rawValue + ") diferă substanţial fată de cea calculată automat(" + vv2 + ")!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     }
}

// ===== #181  form1.date.achizitiiIMP.r27.c2  [calculate]  (formcalc?)
$ = achizitiiIMP.r27_1.c2 + achizitiiIMP.r27_2.c2

// ===== #182  form1.date.achizitiiIMP.r27.c3  [calculate]  (formcalc?)
$ = achizitiiIMP.r27_1.c3 + achizitiiIMP.r27_2.c3

// ===== #183  form1.date.achizitiiIMP.r27_1.c2  [calculate]  (formcalc?)
$ = livrari.r12_1.c2

// ===== #184  form1.date.achizitiiIMP.r27_1.c2  [exit]  (application/x-javascript)
if (this.rawValue != "" || this.rawValue != null) {
 	c3.rawValue = utile.roundNumber(this.rawValue * 0.21, 0);
}

// ===== #185  form1.date.achizitiiIMP.r27_1.c3  [calculate]  (formcalc?)
$ = livrari.r12_1.c3

// ===== #186  form1.date.achizitiiIMP.r27_1.c3  [exit]  (application/x-javascript)
var vv = Math.abs(c2.rawValue);
if (vv != null || vv != ''){
var vv1 = utile.roundNumber(vv * 0.20, 0);
var vv2 = utile.roundNumber(vv * 0.21, 0);
var vv3 = utile.roundNumber(vv * 0.22, 0);
if (this.rawValue != null || this.rawValue != ''){
  if ((vv1 > Math.abs(this.rawValue)) || (Math.abs(this.rawValue) > vv3)) { 
          xfa.host.messageBox("ATENTIE!\n\nSuma introdusă diferă substanţial fată de cea calculată automat!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     //xfa.host.messageBox("ATENTIE!\n\nSuma introdusă in Rd.12.3 col.TVA(" + this.rawValue + ") diferă substanţial fată de cea calculată automat(" + vv2 + ")!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     }
}
}

// ===== #187  form1.date.achizitiiIMP.r27_2.c2  [calculate]  (formcalc?)
$ = livrari.r12_2.c2

// ===== #188  form1.date.achizitiiIMP.r27_2.c2  [exit]  (application/x-javascript)
if (this.rawValue != "" || this.rawValue != null) {
 	c3.rawValue = utile.roundNumber(this.rawValue * 0.11, 0);
}

// ===== #189  form1.date.achizitiiIMP.r27_2.c3  [calculate]  (formcalc?)
$ = livrari.r12_2.c3

// ===== #190  form1.date.achizitiiIMP.r27_2.c3  [exit]  (application/x-javascript)
var vv = Math.abs(c2.rawValue);
var vv1 = utile.roundNumber(vv * 0.10, 0);
var vv2 = utile.roundNumber(vv * 0.11, 0);
var vv3 = utile.roundNumber(vv * 0.12, 0);
if (this.rawValue != null || this.rawValue != ''){
  if ((vv1 > Math.abs(this.rawValue)) || (Math.abs(this.rawValue) > vv3)) {
       xfa.host.messageBox("ATENTIE!\n\nSuma introdusă diferă substanţial fată de cea calculată automat!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0); 
     //xfa.host.messageBox("ATENTIE!\n\nSuma introdusă la Rd.26. col.TVA(" + this.rawValue + ") diferă substanţial fată de cea calculată automat(" + vv2 + ")!\n\nDiferenta recomandata este de +/- 1%.", "Atenţie:", 1, 0);
     }
}

// ===== #191  form1.date.achizitiiIMP.r30.c2  [exit]  (application/x-javascript)
/*
var gt = this.rawValue;
var lt = r30_1.c2.rawValue;
if (gt != null && lt != null){
	if (Number(gt) < Number(lt)){this.rawValue = null; app.alert("Rd.30 nu poate fi mai mic decat rd.30.1!");}
}
*/

var gt = this.rawValue;
var lt = r30_1.c2.rawValue;
if (gt != null && lt != null){
	if (Math.abs(gt) < Math.abs(lt)){this.rawValue = null; app.alert("Rd.30 nu poate fi mai mic decat rd.30.1!");}
}

// ===== #192  form1.date.achizitiiIMP.r31.c2  [calculate]  (formcalc?)
$ = achizitiiRO.r20.c2 + achizitiiRO.r21.c2 + achizitiiRO.r22.c2 + achizitiiRO.r23.c2 + r24.c2  + r25.c2 + r27.c2;
//R27_1 = R18_1 + R19_1+ R20_1+ R21_1+ R22_1+ R23_1+ R24_1+ R25_1 + R74_1 + R75_1
//$ = achizitiiRO.r20.c2 + achizitiiRO.r21.c2 + achizitiiRO.r22.c2 + achizitiiRO.r23.c2 + r24_1.c2 + r24.c2 + r25_1.c2 + r25.c2 + r26.c2 + r27.c2

// ===== #193  form1.date.achizitiiIMP.r31.c3  [calculate]  (formcalc?)
$ = achizitiiRO.r20.c3 + achizitiiRO.r21.c3 + achizitiiRO.r22.c3 + achizitiiRO.r23.c3 + r24.c3 + r25.c3   + r27.c3 + r28.c3 + r29.c3;
//R27_2 = R18_2+ R19_2+ R20_2+ R21_2+ R22_2+ R23_2+ R24_2+ R25_2+ R43_2 + R44_2 + R74_2 + R75_2

// ===== #194  form1.date.achizitiiIMP.r32.c3  [exit]  (application/x-javascript)
/*
var gt = r31.c3.rawValue;
var lt = this.rawValue;
if (gt != null && lt != null){
	if (Math.abs(lt) > Math.abs(gt)){this.rawValue = null; app.alert("Rd.32 col.2 nu poate fi mai mare decat rd.31 col.2!");}
}
*/

// ===== #195  form1.date.achizitiiIMP.r36.c3  [calculate]  (application/x-javascript)
var suma = r32.c3.rawValue + r33.c3.rawValue + r34.c3.rawValue + r35.c3.rawValue;
if (suma != null)this.rawValue = suma;
else this.rawValue = 0;

// ===== #196  form1.date.regularizari.r37.c3  [calculate]  (application/x-javascript)
var v36 = achizitiiIMP.r36.c3.rawValue;
var v19 = livrari.r19.c3.rawValue;
var v37 = v36 - v19;
if (v37 > 0)this.rawValue = v37;
else this.rawValue = 0;

// ===== #197  form1.date.regularizari.r38.c3  [calculate]  (application/x-javascript)
var v36 = achizitiiIMP.r36.c3.rawValue;
var v19 = livrari.r19.c3.rawValue;
var v38 = v19 - v36;
if (v38 > 0)this.rawValue = v38;
else this.rawValue = 0;

// ===== #198  form1.date.regularizari.r41.c3  [calculate]  (application/x-javascript)
var suma = r38.c3.rawValue  + r39.c3.rawValue  + r40.c3.rawValue;
if (suma != null)this.rawValue = suma;
else this.rawValue = 0;

// ===== #199  form1.date.regularizari.r44.c3  [calculate]  (application/x-javascript)
var suma = r37.c3.rawValue  + r42.c3.rawValue  + r43.c3.rawValue;
if (suma != null)this.rawValue = suma;
else this.rawValue = 0;

// ===== #200  form1.date.regularizari.r45.c3  [calculate]  (application/x-javascript)
var v41 = r41.c3.rawValue;
var v44 = r44.c3.rawValue;
var v45 = v41 - v44;
if (v45 > 0)this.rawValue = v45;
else this.rawValue = 0;

// ===== #201  form1.date.regularizari.r46.c3  [calculate]  (application/x-javascript)
var v41 = r41.c3.rawValue;
var v44 = r44.c3.rawValue;
var v46 = v44 - v41;
if (v46 > 0)this.rawValue = v46;
else this.rawValue = 0;

// ===== #202  form1.date.rambursare.bifa_rambursare  [change]  (application/x-javascript)
var rambursare = regularizari.r46.c3.rawValue;
if (rambursare < 5000 && this.rawValue == 'D'){
	app.alert("Nu puteti solicita rambursare daca Soldul sumei negative de TVA la sfârşitul perioadei de raportare (Rd.46) < 5000 !");
	this.rawValue = 'N';
}

// ===== #203  form1.date.nedeductibil.r50.c2  [exit]  (application/x-javascript)
var a = this.rawValue;
var a1 = r50_1.c2.rawValue;
var tva = c3.rawValue;
if (a != null && a1 != null){
	if (Math.abs(a) < Math.abs(a1)){
		app.alert("EROARE!\n\n Rd.A col.Valoare(" + a + ") nu poate fi mai mic decat Rd.A1 col.Valoare(" + a1 + ")!");
		xfa.host.setFocus(this);
	}
}

if (a != null && tva != null){
	if (Math.abs(a) < Math.abs(tva)){
		app.alert("EROARE!\n\n Rd.A col.Valoare(" + a + ") nu poate fi mai mic decat Rd.A col.TVA(" + tva + ")!");
		xfa.host.setFocus(this);
	}
}

// ===== #204  form1.date.nedeductibil.r50.c3  [validate]  (application/x-javascript)
/*
var a = this.rawValue;
var a1 = r50_1.c3.rawValue;
if (a != null && a1 != null){
	if (a < a1){
		app.alert("EROARE!\n\n Rd.A col.TVA(" + a + ") nu poate fi mai mic decat Rd.A1 col.TVA(" + a1 + ")!");
		xfa.host.setFocus(this);
	}
}
*/

// ===== #205  form1.date.nedeductibil.r50.c3  [exit]  (application/x-javascript)
var a = c2.rawValue;
var tvaA = this.rawValue;
var tvaA1 = r50_1.c3.rawValue;
if (tvaA != null && tvaA1 != null){
	if (Math.abs(tvaA1) > Math.abs(tvaA)){
		app.alert("EROARE!\n\n Rd.A col.TVA(" + tvaA + ") nu poate fi mai mic decat Rd.A1 col.TVA(" + tvaA1 + ")!");
		xfa.host.setFocus(this);
	}
}

if (a != null && tvaA != null){
	if (Math.abs(a) < Math.abs(tvaA)){
		app.alert("EROARE!\n\n Rd.A col.TVA(" + a + ") nu poate fi mai mare decat Rd.A col.Valoare(" + tvaA + ")!");
		xfa.host.setFocus(this);
	}
}

// ===== #206  form1.date.nedeductibil.r50_1.c2  [exit]  (application/x-javascript)
var a1 = this.rawValue;
var a = r50.c2.rawValue;
if (a != null && a1 != null){
	if (Math.abs(a) < Math.abs(a1)){
		app.alert("EROARE!\n\n Rd.A col.Valoare(" + a + ") nu poate fi mai mic decat Rd.A1 col.Valoare(" + a1 + ")!");
		xfa.host.setFocus(this);
	}
}

// ===== #207  form1.date.nedeductibil.r50_1.c3  [exit]  (application/x-javascript)
var a1 = c2.rawValue;
var tvaA = r50.c3.rawValue;
var tvaA1 = this.rawValue;
if (tvaA != null && tvaA1 != null){
	if (Math.abs(tvaA1) > Math.abs(tvaA)){
		app.alert("EROARE!\n\n Rd.A col.TVA(" + tvaA + ") nu poate fi mai mic decat Rd.A1 col.TVA(" + tvaA1 + ")!");
		xfa.host.setFocus(this);
	}
}

if (a1 != null && tvaA1 != null){
	if (Math.abs(a1) < Math.abs(tvaA1)){
		app.alert("EROARE!\n\n Rd.A1 col.TVA(" + tvaA1 + ") nu poate fi mai mare decat Rd.A1 col.Valoare(" + a1 + ")!");
		xfa.host.setFocus(this);
	}
}

// ===== #208  form1.date.nedeductibil.r60.c2  [validate]  (application/x-javascript)
/*
var a = this.rawValue;
var a1 = r60_1.c2.rawValue;
if (a != null && a1 != null){
	if (a < a1){
		app.alert("EROARE!\n\n Rd.B col.Valoare(" + a + ") nu poate fi mai mic decat Rd.B1 col.Valoare(" + a1 + ")!");
		xfa.host.setFocus(this);
	}
}
*/

// ===== #209  form1.date.nedeductibil.r60.c2  [exit]  (application/x-javascript)
var b = this.rawValue;
var b1 = r60_1.c2.rawValue;
var tva = c3.rawValue;
if (b != null && b1 != null){
	if (Math.abs(b) < Math.abs(b1)){
		app.alert("EROARE!\n\n Rd.B col.Valoare(" + b + ") nu poate fi mai mic decat Rd.B1 col.Valoare(" + b1 + ")!");
		xfa.host.setFocus(this);
	}
}

if (b != null && tva != null){
	if (Math.abs(b) < Math.abs(tva)){
		app.alert("EROARE!\n\n Rd.B col.Valoare(" + b + ") nu poate fi mai mic decat Rd.B col.TVA(" + tva + ")!");
		xfa.host.setFocus(this);
	}
}

// ===== #210  form1.date.nedeductibil.r60.c3  [validate]  (application/x-javascript)
/*
var a = this.rawValue;
var a1 = r60_1.c3.rawValue;
if (a != null && a1 != null){
	if (a < a1){
		app.alert("EROARE!\n\n Rd.B col.TVA(" + a + ") nu poate fi mai mic decat Rd.B1 col.TVA(" + a1 + ")!");
		xfa.host.setFocus(this);
	}
}
*/

// ===== #211  form1.date.nedeductibil.r60.c3  [exit]  (application/x-javascript)
var b = c2.rawValue;
var tvaB = this.rawValue;
var tvaB1 = r60_1.c3.rawValue;
if (tvaB != null && tvaB1 != null){
	if (Math.abs(tvaB1) > Math.abs(tvaB)){
		app.alert("EROARE!\n\n Rd.B col.TVA(" + tvaB + ") nu poate fi mai mic decat Rd.B1 col.TVA(" + tvaB1 + ")!");
		xfa.host.setFocus(this);
	}
}

if (b != null && tvaB != null){
	if (Math.abs(b) < Math.abs(tvaB)){
		app.alert("EROARE!\n\n Rd.B col.TVA(" + tvaB + ") nu poate fi mai mare decat Rd.B col.Valoare(" + b + ")!");
		xfa.host.setFocus(this);
	}
}

// ===== #212  form1.date.nedeductibil.r60_1.c2  [exit]  (application/x-javascript)
var b1 = this.rawValue;
var b = r60.c2.rawValue;
if (b != null && b1 != null){
	if (Math.abs(b) < Math.abs(b1)){
		app.alert("EROARE!\n\n Rd.B col.Valoare(" + b + ") nu poate fi mai mic decat Rd.B1 col.Valoare(" + b1 + ")!");
		xfa.host.setFocus(this);
	}
}

// ===== #213  form1.date.nedeductibil.r60_1.c3  [exit]  (application/x-javascript)
var b1 = c2.rawValue;
var tvaB = r60.c3.rawValue;
var tvaB1 = this.rawValue;
if (tvaB != null && tvaB1 != null){
	if (Math.abs(tvaB1) > Math.abs(tvaB)){
		app.alert("EROARE!\n\n Rd.B col.TVA(" + tvaB + ") nu poate fi mai mic decat Rd.B1 col.TVA(" + tvaB1 + ")!");
		xfa.host.setFocus(this);
	}
}

if (b1 != null && tvaB1 != null){
	if (Math.abs(b1) < Math.abs(tvaB1)){
		app.alert("EROARE!\n\n Rd.B1 col.TVA(" + tvaB1 + ") nu poate fi mai mare decat Rd.B1 col.Valoare(" + b1 + ")!");
		xfa.host.setFocus(this);
	}
}

// ===== #214  form1.semnatura.prenume  [change]  (application/x-javascript)
xfa.event.change=xfa.event.change.toUpperCase();

// ===== #215  form1.semnatura.nume  [change]  (application/x-javascript)
xfa.event.change=xfa.event.change.toUpperCase();

// ===== #216  form1.semnatura.smnFnc  [change]  (application/x-javascript)
xfa.event.change=xfa.event.change.toUpperCase();

// ===== #217  form1  [exit]  (application/x-javascript)
// Please note that this event is propagated. This means that when a user
// exists any field on the form, it will call the OnExit() function and clear 
// the error highlighting if the field is not null!
oblig.OnExit();

// ===== #218  form1  [initialize]  (application/x-javascript)
//validate disabled
xfa.host.validationsEnabled = false;

// ===== DOC-LEVEL !ADBE::0100_VersChkStrings
if (typeof(this.ADBE) == "undefined")
   this.ADBE = new Object();
ADBE.LANGUAGE = "ENU";
ADBE.Viewer_string_Title = "Adobe Acrobat";
ADBE.Viewer_string_Update_Desc = "Adobe Interactive Forms Update";
ADBE.Reader_string_Need_New_Version_Msg = "This PDF file requires a newer version of Adobe Reader. Press OK to download the latest version or see your system administrator.";
ADBE.Viewer_string_Need_New_Version_Msg_Old = "This PDF requires a newer version of Acrobat. Copy this URL and paste into your browser or see your sys admin.";
ADBE.Viewer_string_Need_New_Version_Msg = "This PDF form requires a newer version of Adobe Acrobat. Without a newer version, the form may display, but may not work properly. Some form elements might not be visible at all. Click OK for more information on obtaining the latest version of Adobe Reader.";
ADBE.Viewer_string_Need_New_Version_Msg_Updater = "This PDF form requires a newer version of Adobe Acrobat. Without a newer version, the form may display, but may not work properly. Some form elements might not be visible at all. If an internet connection is available, clicking OK will download and install the latest version.";


// ===== DOC-LEVEL !ADBE::0100_VersChkVars
if (typeof(ADBE.Reader_Value_Asked) == "undefined")
   ADBE.Reader_Value_Asked = false;
if (typeof(ADBE.Viewer_Value_Asked) == "undefined")
   ADBE.Viewer_Value_Asked = false;
if (typeof(ADBE.Reader_Need_Version) == "undefined" || ADBE.Reader_Need_Version < 9.0)
{
   ADBE.Reader_Need_Version = 9.0;
   ADBE.Reader_Value_New_Version_URL = "http://cgi.adobe.com/special/acrobat/update";
   ADBE.SYSINFO = "?p=" + app.platform + "&v=" + app.viewerVersion + "&l=" + app.language + "&c=" + app.viewerType + "&r=" + ADBE.Reader_Need_Version;
}
if (typeof(ADBE.Viewer_Need_Version) == "undefined" || ADBE.Viewer_Need_Version < 9.0)
{
   ADBE.Viewer_Need_Version = 9.0;
   ADBE.Viewer_Value_New_Version_URL = "http://cgi.adobe.com/special/acrobat/update";
   ADBE.SYSINFO = "?p=" + app.platform + "&v=" + app.viewerVersion + "&l=" + app.language + "&c=" + app.viewerType + "&r=" + ADBE.Viewer_Need_Version;
}


// ===== DOC-LEVEL !ADBE::0200_VersChkCode_XFACheck
if (typeof(xfa_installed) == "undefined" || typeof(xfa_version) == "undefined" || xfa_version < 2.8)
{
   if (app.viewerType == "Reader")
   {
      if (ADBE.Reader_Value_Asked != true)
      {
         if (app.viewerVersion < 9.0)
         {
            if (app.alert(ADBE.Reader_string_Need_New_Version_Msg, 1, 1) == 1)
               this.getURL(ADBE.Reader_Value_New_Version_URL + ADBE.SYSINFO, false);
            ADBE.Reader_Value_Asked = true;
         }
         else if (app.alert(ADBE.Viewer_string_Need_New_Version_Msg_Updater, 1, 1) == 1)
            app.findComponent({cType:"Plugin", cName:"XFA", cVer:"2.8"});
      }
   }
   else
   {
      if (ADBE.Viewer_Value_Asked != true)
      {
         if (app.viewerVersion < 7.0)
            app.response({cQuestion: ADBE.Viewer_string_Need_New_Version_Msg_Old, cDefault: ADBE.Viewer_Value_New_Version_URL + ADBE.SYSINFO, cTitle: ADBE.Viewer_string_Title});
		   else if (app.viewerVersion < 9.0)
         {
            if (app.alert(ADBE.Viewer_string_Need_New_Version_Msg, 1, 1) == 1)
               app.launchURL(ADBE.Viewer_Value_New_Version_URL + ADBE.SYSINFO, true);
         }
         else if (app.alert(ADBE.Viewer_string_Need_New_Version_Msg_Updater, 1, 1) == 1)
            app.findComponent({cType:"Plugin", cName:"XFA", cVer:"2.8"});
         ADBE.Viewer_Value_Asked = true;
      }
   }
}


