// generare xml
/*
versiunea 11.0.0
an 2025 luna august
R69_1 , R69_2 pt rand 9.1
R70_1, R70_2 pt rand 10.1
R71_1, R71_2 pt rand 11.1
R72_1, R72_2 pt rand 12.4
R73_1, R73_2 pt rand 12.5
R74_1, R74_2 pt rand 24.1
R75_1, R75_2 pt rand 25.1
R76_1, R76_2 pt rand 27.4
R77_1, R77_2 pt rand 27.5
*/
function genXML(){
	var obj;
	var xml;
	xml = "<?xml version=\"1.0\"?>\n<declaratie300";
	obj = Antet.d_reprezentant;//an 2021
	if (obj.rawValue != null) xml += " depusReprezentant=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";//an 2021
	obj = Antet.metaDate.luna_r;
	if (obj.rawValue != null) xml += " luna=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = Antet.metaDate.an_r;
	if (obj.rawValue != null) xml += " an=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = Antet.opInterne.mtdSimplificata;
	if (obj.rawValue != null) xml += " bifa_interne=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = Antet.metaDate.d_rez;
	if (obj.rawValue != null) xml += " temei=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = Antet.cifS;
	if (obj.rawValue != null) xml += " cuiSuccesor=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = semnatura.prenume;
	if (obj.rawValue != null) xml += " prenume_declar=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = semnatura.nume;
	if (obj.rawValue != null) xml += " nume_declar=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = semnatura.smnFnc;
	if (obj.rawValue != null) xml += " functie_declar=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = identifCntr.denumire.cif;
	if (obj.rawValue != null) xml += " cui=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = identifCntr.denumire.den;
	if (obj.rawValue != null) xml += " den=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	//adresa
	var adr = '';
	var obj = identifCntr.adresa.str; 
	if (obj.rawValue != null) adr += "strada: " + conversii.schEnt(obj.rawValue.toString()) + ", ";
	var obj = identifCntr.adresa.nr; 
	if (obj.rawValue != null) adr += "nr: " + conversii.schEnt(obj.rawValue.toString()) + ", ";
	var obj = identifCntr.adresa.loc; 
	if (obj.rawValue != null) adr += "localitate: " + conversii.schEnt(obj.rawValue.toString()) + ", ";
	var obj = identifCntr.adresa.judet; 
	if (obj.rawValue != null) adr += "judet: " + conversii.schEnt(obj.editValue.toString()) + ", ";
	var obj = identifCntr.adresa.sect; 
	if (obj.rawValue != null) adr += "sector: " + conversii.schEnt(obj.rawValue.toString()) + ", ";
	var obj = identifCntr.adresa.bloc; 
	if (obj.rawValue != null) adr += "bloc: " + conversii.schEnt(obj.rawValue.toString()) + ", ";
	var obj = identifCntr.adresa.scara; 
	if (obj.rawValue != null) adr += "scara: " + conversii.schEnt(obj.rawValue.toString()) + ", ";
	var obj = identifCntr.adresa.etaj; 
	if (obj.rawValue != null) adr += "etaj: " + conversii.schEnt(obj.rawValue.toString()) + ", ";
	var obj = identifCntr.adresa.apt; 
	if (obj.rawValue != null) adr += "apartament: " + conversii.schEnt(obj.rawValue.toString()) + ", ";
	var obj = identifCntr.adresa.codPst; 
	if (obj.rawValue != null) adr += "cod postal: " + conversii.schEnt(obj.rawValue.toString());
	if (adr != "") xml += " adresa=\"" + conversii.schEnt(adr.toString()) + "\"";
	obj = identifCntr.contact.telefon;
	if (obj.rawValue != null) xml += " telefon=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = identifCntr.contact.fax;
	if (obj.rawValue != null) xml += " fax=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = identifCntr.contact.email;
	if (obj.rawValue != null) xml += " mail=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = identifCntr.banca.den;
	if (obj.rawValue != null) xml += " banca=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = identifCntr.banca.iban;
	if (obj.rawValue != null) xml += " cont=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = identifCntr.caen;
	var obj2 = identifCntr.caen1;
	if (obj.rawValue != null) xml += " caen=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	if (obj2.rawValue != null) xml += " caen=\"" + conversii.schEnt(obj2.rawValue.toString()) + "\"";
	obj = Antet.metaDate.tipDecont;
	if (obj.rawValue != null) xml += " tip_decont=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = identifCntr.proRata;
	if (obj.rawValue != null) xml += " pro_rata=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.bife.caption.bifa_cereale;
	if (obj.rawValue != null) xml += " bifa_cereale=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.bife.caption.bifa_mob;
	if (obj.rawValue != null) xml += " bifa_mob=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.bife.caption.bifa_disp;
	if (obj.rawValue != null) xml += " bifa_disp=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.bife.caption.bifa_cons;
	if (obj.rawValue != null) xml += " bifa_cons=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.rambursare.bifa_rambursare;
	if (obj.rawValue != null) xml += " solicit_ramb=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = Antet.nr_evid;
	if (obj.rawValue != null) xml += " nr_evid=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = Antet.metaDate.totalPlata_A;
	if (obj.rawValue != null) xml += " totalPlata_A=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	
	// tabele
	obj = date.comert.r1.c2;
	if (obj.rawValue != null) xml += " R1_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r2.c2;
	if (obj.rawValue != null) xml += " R2_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r3.c2;
	if (obj.rawValue != null) xml += " R3_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r3_1.c2;
	if (obj.rawValue != null) xml += " R3_1_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r4.c2;
	if (obj.rawValue != null) xml += " R4_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r5.c2;
	if (obj.rawValue != null) xml += " R5_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r5.c3;
	if (obj.rawValue != null) xml += " R5_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r5_1.c2;
	if (obj.rawValue != null) xml += " R5_1_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r5_1.c3;
	if (obj.rawValue != null) xml += " R5_1_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r6.c2;
	if (obj.rawValue != null) xml += " R6_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r6.c3;
	if (obj.rawValue != null) xml += " R6_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r7.c2;
	if (obj.rawValue != null) xml += " R7_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r7.c3;
	if (obj.rawValue != null) xml += " R7_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r7_1.c2;
	if (obj.rawValue != null) xml += " R7_1_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r7_1.c3;
	if (obj.rawValue != null) xml += " R7_1_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r8.c2;
	if (obj.rawValue != null) xml += " R8_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.comert.r8.c3;
	if (obj.rawValue != null) xml += " R8_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";	
	obj = date.livrari.r9.c2;
	if (obj.rawValue != null) xml += " R9_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r9.c3;
	if (obj.rawValue != null) xml += " R9_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r10.c2;
	if (obj.rawValue != null) xml += " R10_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r10.c3;
	if (obj.rawValue != null) xml += " R10_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r11.c2;
	if (obj.rawValue != null) xml += " R11_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r11.c3;
	if (obj.rawValue != null) xml += " R11_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r12.c2;
	if (obj.rawValue != null) xml += " R12_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r12.c3;
	if (obj.rawValue != null) xml += " R12_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r12_1.c2;
	if (obj.rawValue != null) xml += " R12_1_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r12_1.c3;
	if (obj.rawValue != null) xml += " R12_1_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r12_2.c2;
	if (obj.rawValue != null) xml += " R12_2_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r12_2.c3;
	if (obj.rawValue != null) xml += " R12_2_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r13.c2;
	if (obj.rawValue != null) xml += " R13_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r14.c2;
	if (obj.rawValue != null) xml += " R14_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\""
	
	//introduse in an = 2023, eliminate in an = 2024
	//obj = date.livrari.r14_1.c2;
	//if (obj.rawValue != null) xml += " R67_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\""
	//obj = date.livrari.r14_2.c2;
	//if (obj.rawValue != null) xml += " R68_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\""
	
	
	obj = date.livrari.r15.c2;
	if (obj.rawValue != null) xml += " R15_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r16.c2;
	if (obj.rawValue != null) xml += " R16_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r16.c3;
	if (obj.rawValue != null) xml += " R16_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r17.c2;
	if (obj.rawValue != null) xml += " R64_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r17.c3;
	if (obj.rawValue != null) xml += " R64_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r18.c2;
	if (obj.rawValue != null) xml += " R65_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r18.c3;
	if (obj.rawValue != null) xml += " R65_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r19.c2;
	if (obj.rawValue != null) xml += " R17_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.livrari.r19.c3;
	if (obj.rawValue != null) xml += " R17_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiRO.r20.c2;
	if (obj.rawValue != null) xml += " R18_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiRO.r20.c3;
	if (obj.rawValue != null) xml += " R18_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiRO.r20_1.c2;
	if (obj.rawValue != null) xml += " R18_1_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiRO.r20_1.c3;
	if (obj.rawValue != null) xml += " R18_1_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiRO.r21.c2;
	if (obj.rawValue != null) xml += " R19_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiRO.r21.c3;
	if (obj.rawValue != null) xml += " R19_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiRO.r22.c2;
	if (obj.rawValue != null) xml += " R20_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiRO.r22.c3;
	if (obj.rawValue != null) xml += " R20_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiRO.r22_1.c2;
	if (obj.rawValue != null) xml += " R20_1_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiRO.r22_1.c3;
	if (obj.rawValue != null) xml += " R20_1_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiRO.r23.c2;
	if (obj.rawValue != null) xml += " R21_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiRO.r23.c3;
	if (obj.rawValue != null) xml += " R21_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r24.c2;
	if (obj.rawValue != null) xml += " R22_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r24.c3;
	if (obj.rawValue != null) xml += " R22_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r25.c2;
	if (obj.rawValue != null) xml += " R23_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r25.c3;
	if (obj.rawValue != null) xml += " R23_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r27.c2;
	if (obj.rawValue != null) xml += " R25_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r27.c3;
	if (obj.rawValue != null) xml += " R25_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r27_1.c2;
	if (obj.rawValue != null) xml += " R25_1_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r27_1.c3;
	if (obj.rawValue != null) xml += " R25_1_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r27_2.c2;
	if (obj.rawValue != null) xml += " R25_2_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r27_2.c3;
	if (obj.rawValue != null) xml += " R25_2_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
		obj = date.achizitiiIMP.r28.c3;
	if (obj.rawValue != null) xml += " R43_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r29.c3;
	if (obj.rawValue != null) xml += " R44_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r30.c2;
	if (obj.rawValue != null) xml += " R26_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r30_1.c2;
	if (obj.rawValue != null) xml += " R26_1_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r31.c2;
	if (obj.rawValue != null) xml += " R27_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r31.c3;
	if (obj.rawValue != null) xml += " R27_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	//
	obj = date.achizitiiIMP.r32.c3;
	if (obj.rawValue != null) xml += " R28_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r33.c3;
	if (obj.rawValue != null) xml += " R29_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	//
	obj = date.achizitiiIMP.r34.c2;
	if (obj.rawValue != null) xml += " R30_1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r34.c3;
	if (obj.rawValue != null) xml += " R30_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	//
	obj = date.achizitiiIMP.r35.c3;
	if (obj.rawValue != null) xml += " R31_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.achizitiiIMP.r36.c3;
	if (obj.rawValue != null) xml += " R32_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	// august 2025
	// R69_1 , R69_2 pt rand 9.1
		
	obj = date.regularizari.r37.c3;
	if (obj.rawValue != null) xml += " R33_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.regularizari.r38.c3;
	if (obj.rawValue != null) xml += " R34_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	//
	obj = date.regularizari.r39.c3;
	if (obj.rawValue != null) xml += " R35_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.regularizari.r40.c3;
	if (obj.rawValue != null) xml += " R36_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	//
	obj = date.regularizari.r41.c3;
	if (obj.rawValue != null) xml += " R37_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.regularizari.r42.c3;
	if (obj.rawValue != null) xml += " R38_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	//
	obj = date.regularizari.r43.c3;
	if (obj.rawValue != null) xml += " R39_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.regularizari.r44.c3;
	if (obj.rawValue != null) xml += " R40_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	//
	obj = date.regularizari.r45.c3;
	if (obj.rawValue != null) xml += " R41_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.regularizari.r46.c3;
	if (obj.rawValue != null) xml += " R42_2=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	// eof tabele
	
	// facturi emise
	obj = date.r47.c1;
	if (obj.rawValue != null) xml += " nr_facturi=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.r47.c2;
	if (obj.rawValue != null) xml += " baza=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.r47.c3;
	if (obj.rawValue != null) xml += " tva=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	// facturi primite
	obj = date.r48.c1;
	if (obj.rawValue != null) xml += " nr_facturi_primite=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.r48.c2;
	if (obj.rawValue != null) xml += " baza_primite=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.r48.c3;
	if (obj.rawValue != null) xml += " tva_primite=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	// facturi emise art.11
	obj = date.r49.c1;
	if (obj.rawValue != null) xml += " nr_fact_emise=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.r49.c2;
	if (obj.rawValue != null) xml += " total_baza=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.r49.c3;
	if (obj.rawValue != null) xml += " total_tva=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	// TVA neexigibila
	obj = date.nedeductibil.r50.c2;
	if (obj.rawValue != null) xml += " valoare_a=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.nedeductibil.r50.c3;
	if (obj.rawValue != null) xml += " tva_a=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.nedeductibil.r50_1.c2;
	if (obj.rawValue != null) xml += " valoare_a1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.nedeductibil.r50_1.c3;
	if (obj.rawValue != null) xml += " tva_a1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.nedeductibil.r60.c2;
	if (obj.rawValue != null) xml += " valoare_b=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.nedeductibil.r60.c3;
	if (obj.rawValue != null) xml += " tva_b=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.nedeductibil.r60_1.c2;
	if (obj.rawValue != null) xml += " valoare_b1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.nedeductibil.r60_1.c3;
	if (obj.rawValue != null) xml += " tva_b1=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
		// valoarea totala
	obj = date.alteInfo.r50.c1;
	if (obj.rawValue != null) xml += " total_precedent=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
	obj = date.alteInfo.r50.c2;
	if (obj.rawValue != null) xml += " total_curent=\"" + conversii.schEnt(obj.rawValue.toString()) + "\"";
		//eof fisier xml
	//xml += " xmlns:xsi=\"http:\/\/www.w3.org\/2001\/XMLSchema-instance\" xsi:schemaLocation=\"mfp:anaf:dgti:d300:declaratie:v5 d300.xsd\" xmlns=\"mfp:anaf:dgti:d300:declaratie:v5\"\>";
	//an 2023  = v9
	//an 2024 luna 5  = v10
	//an 2025 luna 8  = v11
	xml += " xmlns:xsi=\"http:\/\/www.w3.org\/2001\/XMLSchema-instance\" xsi:schemaLocation=\"mfp:anaf:dgti:d300:declaratie:v11 d300.xsd\" xmlns=\"mfp:anaf:dgti:d300:declaratie:v12\"\>"; 
	xml += "</declaratie300>";
	/*********************
	//eliminare caractere invalide
	*********************/
	var file = event.target;
	file.removeDataObject("Erori si avertizari.txt");
	file.removeDataObject("D300.xml");
	//file.createDataObject("D300.xml",xml);
	//create file xml and convert to utf-8
	var encFile;
	encFile = encodeURI(xml); // Encode
   	event.target.createDataObject("D300.xml",encFile);
  	var oFile = event.target.getDataObjectContents("D300.xml"); // Get the file stream object of the embedded file D300.xml
   	var cFile = util.stringFromStream(oFile, "utf-8"); //Convert to a string
	oFile = decodeURI(cFile); // Decode (convert utf-8)
    oFile = util.streamFromString(oFile);//Convert back to a file stream
	event.target.setDataObjectContents("D300.xml",oFile); //Overwrite file.xml
	return true;
	/***********************
	************************/
}// eof genXML

// validare date
function validForm(){
	//declar niste variabile
	var valid = 1;
	var sem = true;
	var attn = 1;
	var mesaj = "";
	var caption = "";
	var field;
	var file = event.target;
	var myObj , cifAn, i, x = "";
	//
	var an = Antet.metaDate.an_r.rawValue;
	if (an == null){
		valid = 0;
		mesaj += "EROARE - Anul este element obligatoriu\r\n";
	}
	var luna = Antet.metaDate.luna_r.rawValue;
	if (luna == null){
		valid = 0;
		mesaj += "EROARE - Luna este element  obligatoriu\r\n";
	}
	// an = 2024 
	if (an < 2024){
		valid = 0; 
		mesaj += "EROARE - Anul trebuie sa fie mai mare sau egal cu 2024\r\n";
	}
	if (an == 2024 && luna < 5){
		valid = 0; 
		mesaj += "EROARE - Pentru an = 2024 luna trebuie sa fie >= 5\r\n";
	}
	
	var bifaTemei = Antet.metaDate.d_rez.rawValue;
	if (bifaTemei == null){
		valid = 0;
		mesaj += "EROARE - Bifa Declaratie depusa dupa anularea rezervei verificarii ulterioare este element  obligatoriu\r\n";
	}
	var temei = Antet.temeiLegal.rawValue;
	if (bifaTemei == 2 && temei == null){
		valid = 0;
		mesaj += "EROARE - Ati bifat 'Declaratie depusa dupa anularea rezervei verificarii ulterioare' si nu ati completat temeiul legal\r\n";
	}
	var interne = Antet.opInterne.mtdSimplificata.rawValue;
	if (interne == null){
		valid = 0;
		mesaj += "EROARE - 'Se aplica metoda simplificata pentru operatiuni interne' este element obligatoriu\r\n";
	}
	var nume_declar = semnatura.nume.rawValue;
	if (nume_declar == null){
		valid = 0;
		mesaj += "EROARE - Nume declarant este element obligatoriu\r\n";
	}
	var prenume_declar = semnatura.prenume.rawValue;
	if (prenume_declar == null){
		valid = 0;
		mesaj += "EROARE - Prenume declarant este element obligatoriu\r\n";
	}
	var functie_declar = semnatura.smnFnc.rawValue;
	if (functie_declar == null){
		valid = 0;
		mesaj += "EROARE - Functie declarant este element obligatoriu\r\n";
	}
	var cui = identifCntr.denumire.cif.rawValue;
	if (cui == null){
		valid = 0;
		mesaj += "EROARE - Cod de identificare fiscala in scopuri de TVA este element obligatoriu\r\n";
	}
	var den = identifCntr.denumire.den.rawValue;
	if (den == null){
		valid = 0;
		mesaj += "EROARE - Denumirea persoanei impozabile este element obligatoriu\r\n";
	}
	var banca = identifCntr.banca.den.rawValue;
	if (banca == null){
		valid = 0;
		mesaj += "EROARE - Banca este element obligatoriu\r\n";
	}
	var cont = identifCntr.banca.iban.rawValue;
	if (cont == null){
		valid = 0;
		mesaj += "EROARE - Cont bancar este element obligatoriu\r\n";
	}
	var caen = identifCntr.caen.rawValue;
	var caen2= identifCntr.caen1.rawValue;;
	var areCaen = 1;
	if( (caen2 == null || caen2 =="") &&  (caen == null || caen =="")){
	areCaen =0;
	}
	
	if (areCaen == 0){
		valid = 0;
		mesaj += "EROARE - Cod CAEN este element obligatoriu\r\n";
	}
	var decont = Antet.metaDate.tipDecont.rawValue;
	if (decont == null){
		valid = 0;
		mesaj += "EROARE - Perioada de raportare este element obligatoriu\r\n";
	}
	var proRata = identifCntr.proRata.rawValue;
	if (proRata == null){
		valid = 0;
		mesaj += "EROARE - Pro-rata este element obligatoriu\r\n";
	}
	var cereale = date.bife.caption.bifa_cereale.rawValue;
	if (cereale == null){
		valid = 0;
		mesaj += "EROARE - Bifa livrare de cereale si plante tehnice este element obligatoriu\r\n";
	}
	var mob = date.bife.caption.bifa_mob.rawValue;
	if (mob == null){
		valid = 0;
		mesaj += "EROARE - Bifa livrare de telefoane mobile este element obligatoriu\r\n";
	}
	var disp = date.bife.caption.bifa_disp.rawValue;
	if (disp == null){
		valid = 0;
		mesaj += "EROARE - Bifa livrare de dispozitive cu circuite integrate inainte de integrarea lor in produse destinate utilizatorului final este element obligatoriu\r\n";
	}
	var cons = date.bife.caption.bifa_cons.rawValue;
	if (cons == null){
		valid = 0;
		mesaj += "EROARE - Bifa livrare de console de jocuri, tablete PC si laptopuri este element obligatoriu\r\n";
	}
	var rambursare = date.rambursare.bifa_rambursare.rawValue
	if (rambursare == null){
		valid = 0;
		mesaj += "EROARE - Bifa Solicitati rambursarea soldului sumei negative de TVA este element obligatoriu\r\n";
	}
	var evidenta = Antet.nr_evid.rawValue;
	if (evidenta == null){
		valid = 0;
		mesaj += "EROARE - Numarul de evidenta a platii este element obligatoriu\r\n";
	}
	var R17_1 = date.livrari.r19.c2.rawValue;
	if (R17_1 == null){
		valid = 0;
		mesaj += "EROARE - Randul 19 coloana 1 este element obligatoriu\r\n";
	}
	var R17_2 = date.livrari.r19.c3.rawValue;
	if (R17_2 == null){
		valid = 0;
		mesaj += "EROARE - Randul 19 coloana 2 este element obligatoriu\r\n";
	}
	var R27_1 = date.achizitiiIMP.r31.c2.rawValue;
	if (R27_1 == null){
		valid = 0;
		mesaj += "EROARE - Randul 30 coloana 1 este element obligatoriu\r\n";
	}
	var R27_2 = date.achizitiiIMP.r31.c3.rawValue;
	if (R27_2 == null){
		valid = 0;
		mesaj += "EROARE - Randul 30 coloana 2 este element obligatoriu\r\n";
	}
	var R32_2 = date.achizitiiIMP.r36.c3.rawValue;
	if (R32_2 == null){
		valid = 0;
		mesaj += "EROARE - Randul 35 coloana 2 este element obligatoriu\r\n";
	}
	var R33_2 = date.regularizari.r37.c3.rawValue;
	if (R33_2 == null){
		valid = 0;
		mesaj += "EROARE - Randul 36 este element obligatoriu\r\n";
	}
	var R34_2 = date.regularizari.r38.c3.rawValue;
	if (R34_2 == null){
		valid = 0;
		mesaj += "EROARE - Randul 37 este element obligatoriu\r\n";
	}
	var R35_2 = date.regularizari.r39.c3.rawValue;
	var R38_2 = date.regularizari.r42.c3.rawValue;
	if (R38_2 > 0 && R35_2 != 0){
		valid = 0;
		mesaj += "EROARE - Daca R41 > 0 , atunci R38 = 0\r\n";
	}
		if (R35_2 > 0 && R38_2 != 0){
		valid = 0;
		mesaj += "EROARE - Daca R38 > 0 , atunci R41 = 0\r\n";
	}
	var R37_2 = date.regularizari.r41.c3.rawValue;
	if (R37_2 == null){
		valid = 0;
		mesaj += "EROARE - Randul 40 este element obligatoriu\r\n";
	}
	var R40_2 = date.regularizari.r44.c3.rawValue;
	if (R40_2 == null){
		valid = 0;
		mesaj += "EROARE - Randul 43  este element obligatoriu\r\n";
	}
	var R41_2 = date.regularizari.r45.c3.rawValue;
	if (R41_2 == null){
		valid = 0;
		mesaj += "EROARE - Randul 44 este element obligatoriu\r\n";
	}
	var R42_2 = date.regularizari.r46.c3.rawValue;
	if (R42_2 == null){
		valid = 0;
		mesaj += "EROARE - Randul 45 este element obligatoriu\r\n";
	}
	var sumaControl = Antet.metaDate.totalPlata_A.rawValue;
	if (sumaControl == null){
		valid = 0;
		mesaj += "EROARE - Suma de control  este element obligatoriu\r\n";
	}
	/*
	//an2023
	
		if (date.livrari.r14.c2.rawValue != null)		var v14 = date.livrari.r14.c2.rawValue; else var v14 = 0;
		if (date.livrari.r14_1.c2.rawValue !=  null) 	var v14_1 = date.livrari.r14_1.c2.rawValue; else var v14_1 = 0;
		if (date.livrari.r14_2.c2.rawValue) 			var v14_2 = date.livrari.r14_2.c2.rawValue;  else var v14_2 = 0;
		
		if (v14 < v14_1 + v14_2){
			valid = 0;
			mesaj += "EROARE - Randul 14 nu poate fi mai mic decat suma rd.14.1 si rd.14.2\r\n";
		}
		
	*/
		
	if(valid == 0) {// sunt erori: generez Erori si avertizari.txt; formular NEVALIDAT
		//xfa.host.messageBox(mesaj);
		xfa.host.messageBox("Verificati fisierul atasat pentru erori si avertizari!\n\nFormularul nu este valid!","D300");
		//sterg xml-ul pt ca nu vreau sa ramana daca am erori
		file.removeDataObject("D300.xml");
		sem = false;
		file.removeDataObject("Erori si avertizari.txt");
		file.createDataObject("Erori si avertizari.txt", mesaj);
		//blochez semnatura
		Antet.IdDoc.sgn.access = "readOnly";
	}
	/*
	else{
		if(attn == 0){// sunt avertizari: generez fisier .xml si Erori si avertizari.txt; formular VALID
			mesaj = "ATENTIE\r\n"+mesaj;			
			file.removeDataObject("Erori si avertizari.txt");
			file.createDataObject("Erori si avertizari.txt", mesaj);				
			xfa.host.messageBox("Verificati fisierul atasat pentru atentionari!\n\nExista atentionari, dar fisierul a fost XML generat.","F3101");		
	 		//var mesaj = "Respectați dispoziţiile privind citirea şi păstrarea memoriei fiscale şi a dispozitivului de memorare a jurnalului electronic, după caz, în conformitate cu prevederile O.U.G. nr. 28/1999 şi H.G. nr. 479/2003!";
			//xfa.host.messageBox(mesaj,"Atentionare",1,0);
	 		genXML();
	 		// blochez formularul
			blocDebloc.blochez();
			//deblochez semnatura
			Antet.IdDoc.sgn.access = "open";
	 		
	 	}
	 */
	else{// nu sunt erori si nici avertizari: generez fisier .xml; fomular VALID		 
			file.removeDataObject("Erori si avertizari.txt");
			//calculez suma de control
			//Antet.metaDate.totalPlata_A.rawValue = utile.sumaControl();
			//generez xml
			genXML();
			var mesaj = "Formularul este valid.\n\nA fost atasat fisierul D300.xml."; 
			//if (infP.ops.rawValue != null) mesaj += "\n\nMai aveti un pas:\n- Trebuie sa atasati arhiva .zip!";
			xfa.host.messageBox(mesaj,"D300", 1, 0 );
			//var mesaj = "Respectați dispoziţiile privind citirea şi păstrarea memoriei fiscale şi a dispozitivului de memorare a jurnalului electronic, după caz, în conformitate cu prevederile O.U.G. nr. 28/1999 şi H.G. nr. 479/2003!";
			//xfa.host.messageBox(mesaj,"Atentionare",1,0);
			// blochez formularul
			formular.blochez();
			//deblochez semnatura
			Antet.IdDoc.sgn.access = "open";			 	
		}		
	return sem;				
}
