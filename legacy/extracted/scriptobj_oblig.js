// CheckForErrors(); PrintMandatory(); OnExit()
/*************************************************************************************************
Function: 		CheckForErrors
Description:	Verifica toate obiectele din subforma si atentioneaza utilizatorul in cazul aparitiei unor erori. 
In: 			Parintele subformei. Poate fi, de asemenea, un element care contine subforma, ca "form1"
Out: 			Returneaza lista obiectelor care prezinta erori la validare.
*************************************************************************************************/

function CheckForErrors(myParentObject) {
	
	// Declar variabile
	var allChildElements;
	var intNumElements;
	var currentElement;
	var i;
	var valid = 0; 
	
	// Obține toate nodurile copil ale elementului parinte. Lista(sir) tuturor obiectelor copil ale obiectului curent(parinte)
	allChildElements = myParentObject.nodes;

	// Numarul total de elemente ale obiectului.
	intNumElements = allChildElements.length;
	
	// Bucla prin toate elementele copil
	for (i=0; i<intNumElements; i++) {
		currentElement = allChildElements.item(i);

		// Cazul 1 din 4
		// Daca elementul este o alta subforma, se apeleaza recursiv functia din nou
		if (allChildElements.item(i).className === "subform") {
			CheckForErrors(currentElement);
		}
		
		// Cazul 2 din 4
		// Daca obiectul este de tip 'field', este setat obligatoriu(mandatory) (validate.nullTest) si nu este completat, atunci
		// evidentiem obiectul  si il adaugam  la variabila globala  "errMsg"
		else if(currentElement.className === "field") {	 
			// Verifica daca a fost completat campul
			if (currentElement.validate.nullTest != "disabled" && (currentElement.rawValue === null || currentElement.rawValue === "000")) {
				currentElement.fillColor = "255,200,200";
				errMsg.value += "\n\t- " + currentElement.assist.toolTip.value;
				errCount.value += 1;
				valid = 1; 
			} 
			else {
				currentElement.nodes.remove(currentElement.border);
			}
			
			// Cazul 3 din 4 (note this is specifically within the className "field" section)
			// Daca obiectul este de tip 'checkbox', este setat obligatoriu si nu este bifat atunci
			// evidentiem obiectul  si il adaugam  la variabila globala  "errMsg"
			if (currentElement.ui.oneOfChild.className === "checkButton") {	 
			// Verifica daca elemntul este bifat 
				if (currentElement.validate.nullTest != "disabled" && currentElement.rawValue === 0) {
					currentElement.fillColor = "255,200,200";
					errMsg.value += "\n\t- " + currentElement.assist.toolTip.value;
					errCount.value += 1;
					valid = 1;
				} 
				else {
					currentElement.nodes.remove(currentElement.border);
				}
			}
		}	
				
		// Cazul 4 din 4
		// Daca obiectul este de tip 'radio button', este setat obligatoriu si nu este bifat atunci
		// evidentiem obiectul  si il adaugam  la variabila globala  "errMsg"
		else if(currentElement.className === "exclGroup") {	 
			// Verifica daca a fost selectat un radio buton
			if (currentElement.validate.nullTest != "disabled" && currentElement.rawValue === "") {
				currentElement.fillColor = "255,200,200";
				errMsg.value += "\n\t- " + currentElement.assist.toolTip.value;
				errCount.value += 1;
				valid = 1; 
			} 
			else {
				currentElement.nodes.remove(currentElement.border);
			}
		}

	}
			//app.alert (valid);	
} // End of the CheckForErrors() function



/*************************************************************************************************
Function: 		PrintMandatory
Description:	Parcurge toate obiectele formei si creaza o lista cu campurile obligatorii 
In: 			Parintele subformei. Poate fi, de asemenea, un element care contine subforma, ca "form1"
Out: 			Returneaza lista campurilor obligatorii
*************************************************************************************************/

function PrintMandatory(myParentObject) {

	// Declar variabile
	var allChildElements;
	var intNumElements;
	var currentElement;
	var currentTracker; 
	var i, j; 
	
	// Obține toate nodurile copil ale elementului parinte. Lista(sir) tuturor obiectelor copil ale obiectului curent(parinte)
	allChildElements = myParentObject.nodes;

	// Numarul total de elemente ale obiectului.
	intNumElements = allChildElements.length;
	
	// Parcurge toate elementele copil
	for (i=0; i<intNumElements; i++) {
		currentElement = allChildElements.item(i);

		// Cazul 1 din 4
		// Daca elementul este de tip "subform", atunci rechem recursiv functia
		if (allChildElements.item(i).className === "subform") {
			PrintMandatory(currentElement);
		}
		
		// Cazul 2 din 4
		// Daca obiectele sunt de tip 'field' si sunt obligatorii atunci se adauga la lista
		
		else if(currentElement.className === "field") {	 
			// Verifica daca campul este obligatoriu
			if (currentElement.validate.nullTest != "disabled" && currentElement.ui.oneOfChild.className !== "checkButton") {
				// Adauga campul la lista
				page0._tracker.addInstance(true);
				j = page0._tracker.count - 1; 
				currentTracker = xfa.resolveNode("page0.tracker[" + j + "]"); 
				currentTracker.mandatoryField.rawValue = currentElement.assist.toolTip.value; 
				// Verifica daca campul obligatoriu este null
				if (currentElement.rawValue !== null) {
					currentTracker.completed.rawValue = 1; 
				}
			} 
			
			// Cazul 3 din 4 (note this is specifically within the className "field" section)
			// Daca obiectul este de tip 'checkButton' si este setat obligatoriu, atunci adauga la lista

			if (currentElement.validate.nullTest != "disabled" && currentElement.ui.oneOfChild.className === "checkButton") {	 
				// Add field to the list
				page0._tracker.addInstance(true);
				j = page0._tracker.count - 1; 
				currentTracker = xfa.resolveNode("page0.tracker[" + j + "]"); 
				currentTracker.mandatoryField.rawValue = currentElement.assist.toolTip.value; 
				// Verifica daca campul obligatoriu este null
				if (currentElement.rawValue != 0) {
					currentTracker.completed.rawValue = 1; 
				}
			}
		}	
				
		// Cazul 4 din 4
		// Daca obiectul este de tip 'radio button' si este setat obligatoriu, atunci adauga la lista
		else if(currentElement.className === "exclGroup") {	 
			// Verifica daca este obligatoriu
			if (currentElement.validate.nullTest != "disabled") {
				// Adauga campul la lista
				page0._tracker.addInstance(true);
				j = page0._tracker.count - 1; 
				currentTracker = xfa.resolveNode("page0.tracker[" + j + "]"); 
				currentTracker.mandatoryField.rawValue = currentElement.assist.toolTip.value; 
				// Verifica daca campul obligatoriu este null
				if (currentElement.rawValue !== "") {
					currentTracker.completed.rawValue = 1; 
				}
			}
		}	
	}
} // End of the PrintMandatory() function



/*************************************************************************************************
Function: 		OnExit
Description:	Verifica daca la evenimentul Exit campul este completat. Daca Da, atunci sterge evidentierea de camp eronat
In: 			xfa.event.target
Out: 			nimic
*************************************************************************************************/

function OnExit() {
 
	// Check that general fields are not null
	if (xfa.event.target.className === "field" && xfa.event.target.ui.oneOfChild.className !== "checkButton" && xfa.event.target.rawValue !== null) {
		xfa.event.target.nodes.remove(xfa.event.target.border);
	}
		
	// Check that checkboxes are not null (default unticked value is 0)
	else if (xfa.event.target.className === "field" && xfa.event.target.ui.oneOfChild.className === "checkButton" && xfa.event.target.rawValue !== 0) {
		xfa.event.target.nodes.remove(xfa.event.target.border);
	}
	
	// Check that radio buttons are not null
	else if (xfa.event.target.className === "exclGroup" && xfa.event.target.rawValue != "") {
		xfa.event.target.nodes.remove(xfa.event.target.border);
	}
} // End of the OnExit() function


