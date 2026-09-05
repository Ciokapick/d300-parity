//sterge_zip()
//verific_zip()
//adauga_zip()
//verific_xml()
//sterge_xml()

// algoritm pentru verificarea dimensiunii tuturor fisierelor atasate.Intoarce:
// suma dimesinii tuturor fisierelor atasate in MB
function calculateAttachSize(){
	var sum = 0;
	var file = event.target;
	var d = file.dataObjects;
	var v1;
	if (d != null){
		for (var i = 0; i < d.length; i++){
			sum += Number(d[i].size+"");
		}	
	}		
	return sum;
}
// algoritm pentru stregerea fisierelor cu extenzia .zip
// daca gaseste, sterge fier cu extensia.zip din fisierle atasate
function sterge_zip(){
    var ver1 = 0;
	var sum = 0;
	var file = event.target;
	var d = file.dataObjects;
	var ext_fis;
	var gasit = -1;
	if (d != null){
		for (var i = 0; i < d.length; i++){
			ext_fis = d[i].path.substring(d[i].path.lastIndexOf(".")).toUpperCase();
			if (ext_fis == ".ZIP") {
				file.removeDataObject(d[i].name); gasit=1;
			}
		}
    }				
   if (gasit == 1) app.alert("Fisierele .ZIP atasate anterior au fost sterse."); 
		
}
// algoritm pentru verificarea fisierelor cu extenzia .zip. Intoarce:
// 1 - fisier cu extensia .zip atasat
// 0 - niciun fisier cu extensia .zip atasat
function verific_zip(){
	var err1 = 0;
	var file = event.target;
	var d = file.dataObjects;
	var ext_fis;
	var gasit = 0;
	if (d != null){
		for (var i = 0; i < d.length; i++){
			ext_fis = d[i].path.substring(d[i].path.lastIndexOf(".")).toUpperCase();
			if (ext_fis == ".ZIP") gasit = gasit + 1; 
		}	
	}
	if (gasit != 1){
		if (gasit == 0) xfa.host.messageBox("Nu ati atasat arhiva .ZIP cu documentele conexe !");
		if (gasit > 1){
			xfa.host.messageBox("Ati atasat mai mult de o arhiva .ZIP cu documentele conexe ! \n\nArhivele vor fi sterse si va trebui sa reluati atasarea arhivei.");
			sterge_zip();
		}
	}
	else err1 = 1;
	return err1;
}

//algoritm pentru adaugarea unui fisier cu extensia.zip
function adauga_zip(){
	sterge_zip();
	var file = event.target;
	var sFile = "Import arhiva .ZIP";
	/*
	//progress bar -------
	var t = app.thermometer;
	t.value = 0;
	t.text = "Processing";
	t.begin();
    if (!file.importDataObject(sFile)) {t.end(); return;}    
	t.end();
	//------------------------------
	*/
	
	if (!file.importDataObject(sFile)) {return;}
	file = event.target;
	var d = file.getDataObject(sFile);
	var ext_fis = d.path.substring(d.path.lastIndexOf(".")).toUpperCase();
	var nume_fis = d.path.substring(0,d.path.lastIndexOf("."));
	var lung_nume = nume_fis.length;
	var gasit = -1;
	if (ext_fis == ".ZIP") gasit = 0;
	var er1 = 0;
	var v1;
	//dim.tuturor fis.atasate (XML+ZIP)
	if (calculateAttachSize() > 10000000){
		v1 = calculateAttachSize();
		v1 = Math.round(v1/1024/1024,1);
		xfa.host.messageBox("Dimensiunea maxima a fisierelor atasate (.XML si .ZIP) este de " + 
	                     v1 + " MB si nu trebuie sa depaseasca 10 MB.");		
		file.removeDataObject(sFile);
		er1=1;
	}
	if (gasit == -1){
		xfa.host.messageBox("Fisierul selectat nu are extensie .ZIP.");
		file.removeDataObject(sFile);
		er1=1;		
	}
	if (lung_nume > 50){
		xfa.host.messageBox("Numele fisierelor atasate nu trebuie sa depaseasca 50 caractere.");
		file.removeDataObject(sFile);
		er1 = 1;
	}
	if (er1	==	0)  xfa.host.messageBox("Fisierul .ZIP a fost atasat.");
}
// algoritm pentru verificarea fisierelor cu extenzia .xml. Intoarce:
// 1 - fisier cu extensia .xml atasat
// 0 - niciun fisier cu extensia .xml atasat
function verific_xml(){
	var err_xml = 0;
	var file = event.target;
	var d = file.dataObjects;
	var ext_fis;
	var gasit = 0;
	if (d != null){
		for (var i = 0; i < d.length; i++){
			ext_fis = d[i].path.substring(d[i].path.lastIndexOf(".")).toUpperCase();
			if (ext_fis == ".XML") gasit = gasit+1; 
		}	
	}
	if (gasit != 1){
		if (gasit == 0) xfa.host.messageBox("Nu exista un fisier .xml atasat!\n\nFisierul .xml se genereaza si ataseaza in mod automat dupa validarea formularului.\n\nTrebuie sa validati formularul, click pe butonul 'Validare'...");
		if (gasit > 1){
			xfa.host.messageBox("Ati atasat mai mult de un fisier .xml ! Fisierele vor fi sterse si va trebui sa reluati validarea formularului.");
			sterge_xml();
		}
	}
	else err_xml = 1;
	return err_xml;
}
// algoritm pentru stregerea fisierelor cu extenzia .xml
// daca gaseste, sterge fisier cu extensia.xmldin fisierle atasate
function sterge_xml(){
    var ver1 = 0;
	var sum = 0;
	var file = event.target;
	var d = file.dataObjects;
	var ext_fis;
	var gasit = -1;
	if (d != null){
		for (var i = 0; i < d.length; i++){
			ext_fis = d[i].path.substring(d[i].path.lastIndexOf(".")).toUpperCase();
			if (ext_fis==".XML") {
				file.removeDataObject(d[i].name); 
				gasit = 1; 
			}
		}
    }				
   if (gasit == 1) app.alert("Fisierele .xml atasate anterior au fost sterse."); 
		
}

