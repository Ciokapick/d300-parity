//blochez()
//deblochez()
//removeDataObjects() - sterg atasamentele
// sterg_signature
function blochez(){
//blochez campuri
	var v1 = xfa.host.numPages + 2;
	for (var nPageCount = 0; nPageCount < v1; nPageCount++) {
		var oFields = xfa.layout.pageContent(nPageCount, "field");
		var nNodesLength = oFields.length;
		for (var nNodeCount = 0; nNodeCount < nNodesLength; nNodeCount++) {
			oFields.item(nNodeCount).access = "readOnly";
		}
	}

//gestionez butoane
	// istoric
btnDoc.btnIstoric.access = "open";
btnDoc.btnIstoric.relevant = "-print";
	//asistenta
btnDoc.btnHelp.access = "open";
btnDoc.btnHelp.relevant = "-print";
	//rapProbTehnica
btnDoc.btnRpt.access = "open";
btnDoc.btnRpt.relevant = "-print";
	// valid & wait
btnDoc.btnValid.presence = "hidden";
btnDoc.btnWait.presence = "invisible";
	//listareBtn
btnDoc.btnList.presence = "visible";		
btnDoc.btnList.access = "open";
btnDoc.btnList.relevant = "-print";
	//deblocareBtn
btnDoc.btnDebloc.presence = "visible";	
btnDoc.btnDebloc.access = "open";
btnDoc.btnDebloc.relevant = "-print";
	//atasezZip
btnDoc.btnZip.presence = "visible";
btnDoc.btnZip.access = "open";
btnDoc.btnZip.relevant = "-print";
	// modific status stampila Nevalidat/ Validat
Antet.IdDoc.formValid.rawValue = "FORMULAR VALIDAT";
Antet.IdDoc.formValid.border.fill.color.value = "250, 250, 250";
Antet.IdDoc.formValid.font.fill.color.value = "0, 0, 0";
Antet.IdDoc.formValid.font.weight = "normal";
}// eof blochez()



function deblochez(){
	var v1 = xfa.host.numPages+1;
		for (var nPageCount = 0; nPageCount < v1; nPageCount++){
			var oFields = xfa.layout.pageContent(nPageCount, "field");
			var nNodesLength = oFields.length;
			for (var nNodeCount = 0; nNodeCount < nNodesLength; nNodeCount++){
				field = oFields.item(nNodeCount);
				if (field.assist.speak.value == "protected") field.access="readOnly";
				else field.access = "open";
			}//for		
		}//for
	// modific status stampila Nevalidat/ Validat
Antet.IdDoc.formValid.rawValue = "FORMULAR NEVALIDAT";
Antet.IdDoc.formValid.border.fill.color.value = "255, 0, 0";
Antet.IdDoc.formValid.font.fill.color.value = "250, 250, 250";
Antet.IdDoc.formValid.font.weight = "bold";
	//gestionez butoane	
	// validBtn & waitBtn
btnDoc.btnValid.presence = "visible";
btnDoc.btnWait.presence = "invisible";
	
	//listareBtn
btnDoc.btnList.presence = "hidden";		
btnDoc.btnList.access = "protected";
btnDoc.btnList.relevant = "-print";
	//deblocareBtn
btnDoc.btnDebloc.presence = "hidden";		
btnDoc.btnDebloc.access = "protected";
btnDoc.btnDebloc.relevant = "-print";
	//atasezZip
btnDoc.btnZip.presence = "hidden";
btnDoc.btnZip.access = "protected";
btnDoc.btnZip.relevant = "-print";
	//totalPlata_A
	Antet.metaDate.totalPlata_A.rawValue = '';
Antet.metaDate.totalPlata_A.access = "readOnly";
	
}


// sterg fisiere atasate
function removeDataObjects(){
	file = event.target;
	var d = file.dataObjects;
	if (d != null){
		for (var i = 0; i < d.length; i++){
			file.removeDataObject(d[i].name);
		}
	}	
}
 
//sterg semnatura
function sterg_signature(){
// Declar nistevariabile
	var allChildElements;
	var intNumElements;
	var currentElement;
	var i; 
	// Obține toate nodurile copil ale elementului parinte. Lista(sir) tuturor obiectelor copil ale obiectului curent(parinte)
	allChildElements = form1.nodes;
	// Numarul total de elemente ale obiectului.
	intNumElements = allChildElements.length;
	
	// Bucla prin toate elementele copil
	for (i = 0; i < intNumElements; i++) {
		currentElement = allChildElements.item(i);
		if (allChildElements.item(i).className === "signature") {
			event.target.resetForm(currentElement);// sterg semnatura
		}
	}
 removeDataObjects(); //sterg atasamente
}

