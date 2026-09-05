/************************************
******** indeparteaza spatii din ambele parti ale unui sir
************************************/
function trimSpaces(x) {
    return x.replace(/^\s+|\s+$/gm,'');
}
/************************************
******** indepartare spatii din sir
************************************/
function remSpaces(x) {
    return x.replace(/\s+/g, '');
}
/************************************
******** verifica daca exista caractere nepermise
******** returneaza caraterele nepermise introduse
************************************/
function invalidChr(string, regex) {
    var result = string.match(regex);
    return result;
	}
//eof invalidChr()
/************************************
******** verifica dacă un sir conține elemente dintr-un alt sir
******** param: sir de verificat, sir tinta
******** returneaza: elementele care difera sau 'true'
************************************/
function matchInArray(toMatch, target){
var found, i, cur;
var notFound = [];
found = true;
  for(var i = 0; i < toMatch.length; i++){
    if(target.indexOf(toMatch[i]) === -1){
       found = false;
       cur = toMatch[i];
       notFound.push(cur);
       }
}
  if (found == false) return notFound;
	else return found;
}

/**********************************
******** verifica daca o valoare se afla intr-un sir
******** daca da, returneaza true
************************************/
function isInArray(value, array) {
  return array.indexOf(value) > -1;
}
/**********************************
//pun primul caracter cu litera mare intr-un sir
************************************/
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
/**********************************
******** numara elementele unice dintr-un sir
******** returneaza numarul elementelor unice
************************************/
function countUnique(iterable) {
	return new Set(iterable).size;
}
/**********************************
******** elimina elementele duplicate dintr-un sir
******** returneaza un sir cu elemente unice
************************************/
function removeDuplicates(arr){
	return arr.reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[]);
}
/**********************************
******** determina elementele duplicate si indexul lor intr-un sir
******** returneaza un obiect de tip JSON {'element':[index1,index2,index3....]}
************************************/
function getDuplicatesIndex(arr){
    var duplicates = {};
    for (var i = 0; i < arr.length; i++) {
        if(duplicates.hasOwnProperty(arr[i])) {
            duplicates[arr[i]].push(i);                
        } else if (arr.lastIndexOf(arr[i]) !== i) {
            duplicates[arr[i]] = [i];
        }
    }
    return duplicates;
}
/*************************
// rotunjire 
*************************/

function roundNumber(number, digits) {
            var multiple = Math.pow(10, digits);
            if (number != null)var rndedNum = Math.round(number * multiple) / multiple;
            return rndedNum;
        }

/*************************
// an bisect
*************************/

function leapYear(year){// an bisect = 366 zile = true ; an obisnuit = 365 zile = false
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}


/*************************
// numar de zile intre doua date
*************************/
function days_between(date1, date2) {
var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
var dt1 = new Date(date1);
var dt2 = new Date(date2);
var diffDays =  Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
return diffDays;
}

/*************************
// data curenta in format zz-lll-aaaa
*************************/
function currentDate() {
	var month_names =["Ian","Feb","Mar",
                      "Apr","Mai","Iun",
                      "Iul","Aug","Sep",
                      "Oct","Nov","Dec"];
    var d = new Date();                   
    var day = d.getDate();
    var month_index = d.getMonth();
    var year = d.getFullYear(); 
    return "" + day + "-" + month_names[month_index] + "-" + year;
}
/*************************
// sterg fisiere atasate	
*************************/
function removeDataObjects(){
	file = event.target;
	var d = file.dataObjects;
	if (d != null){
		for (var i = 0; i < d.length; i++){
			file.removeDataObject(d[i].name);
		}
    }		
}
/*************************
// suma valorilor elementelor duplicate intr-un vector bidimensional
// returneaza	un vector bidimensional
*************************/
function sumaDuplicate(source){
	var last;
	var folded = source.reduce(function(prev,curr){
		if (last) {
			if (last[0] === curr[0]) {
				last[1] += curr[1];
				return prev;
			}
		}
    	last = curr;
    	prev.push(curr);
    	return prev;
	},[]);
	//folded = JSON.stringify(folded);
	return folded
}

/*******************************
******** Converteste sirul 'zz.ll.aaaa. la un obiect de tip data
************************************/
function toDate(dateStr) {
  var parts = dateStr.split(".")
  return new Date(parts[2], parts[1] - 1, parts[0])
}
/*******************************
******** verifica corelatia tipDecont si luna raportare
************************************/
function check_tipDecont(){
	var luna = Antet.metaDate.luna_r.rawValue;
	//var anul = Antet.metaDate.an_r.rawValue;
	var tiptva = Antet.metaDate.tipDecont.rawValue;
  
	var mesajT = "Pentru decont trimestrial luna de raportare trebuie sa fie 3,6,9,12 sau 2,5,8,11 (achizitii intracomunitare).";  
	var mesajS = "Pentru decont semestrial luna de raportare trebuie sa fie 6 sau 12.";
	var mesajA = "Pentru decont anual luna de raportare trebuie sa fie 12.";

	if (luna != null){
		//trimestrial 
		if (tiptva == "T" && luna != 3 && luna != 6 && luna != 9 && luna !=12 && 
                     luna != 2 && luna != 5 && luna != 8 && luna != 11  ){
			app.alert(mesajT);
			Antet.metaDate.tipDecont.rawValue = "L";
			Antet.metaDate.luna_r.rawValue = '';
		}
  
		//semestrial
		if (tiptva == "S" && luna!=6 && luna!=12){
			app.alert(mesajS);
			Antet.metaDate.tipDecont.rawValue = "L";
			Antet.metaDate.luna_r.rawValue = '';
		}  

		//anual
		if (tiptva == "A" && luna!=12){
			app.alert(mesajA);
			Antet.metaDate.tipDecont.rawValue = "L";
			Antet.metaDate.luna_r.rawValue = '';
		}    
	}
  
}//check_tipDecont

/*******************************
******** calculeaza numar evidenta a platii
************************************/
function manageRegistrationNumber(){
  var referencePeriod = getReferencePeriod();
  if (referencePeriod != null){
    var registrationNumber = calculateRegistrationNumber(referencePeriod);
    Antet.nr_evid.rawValue = registrationNumber;
  }
}



function getReferencePeriod(){
  var refYear  = Antet.metaDate.an_r.rawValue;
  var refMonth = Antet.metaDate.luna_r.rawValue;
  if (refYear != null && refMonth != null){
    var dateRef = new Date(refYear, refMonth - 1);
    return dateRef;
  } 
  else return null;
}

function calculateRegistrationNumber(pRefPeriod){

  var paymentRegNumber = "";
  var scheduledControl = 0;

  var ddRule = Antet.metaDate.tipDecont.rawValue;
  if (ddRule == "L") ddRule = '301';
  if (ddRule == "T") ddRule = '302';
  if (ddRule == "S") ddRule = '303';
  if (ddRule == "A") ddRule = '304';
  var ddReference = pRefPeriod;
  var deadline = new Date();
  var deadlineFmt = "";

  var trim1 = new Array(0,1,2);
  var trim2 = new Array(3,4,5);
  var trim3 = new Array(6,7,8);
  var trim4 = new Array(9,10,11);

  var refMonth = pRefPeriod.getMonth();
  var refMonth2 = (refMonth<9) ? "0" + (refMonth+1) : (refMonth+1);
  var refYear = pRefPeriod.getFullYear();
  var refYear2 = (""+refYear).substr(2);
  var endMonth = "";
  var endYear = "";

  // - Lunar si trim.
  if (ddRule == "301" || ddRule == "302"){  
    endYear = (refMonth < 11) ? refYear : refYear+1; 
    endMonth = (refMonth < 11) ? refMonth+1 : 0;
    deadline = new Date(endYear, endMonth, 25,12,0,0);
  }
   // - Semestrial
  if (ddRule == "303"){
	endYear = (refMonth < 9) ? refYear : refYear+1;
	if (refMonth == 0 || refMonth == 1 || refMonth == 2  || refMonth == 3 || refMonth == 4 || refMonth == 5) endMonth = 6;
	if (refMonth == 6 || refMonth == 7 || refMonth == 8  || refMonth == 9 || refMonth == 10 || refMonth == 11) endMonth = 0;
	deadline = new Date(endYear, endMonth, 25, 12,0,0);
  }

  // - Anual
  if (ddRule == "304"){
    endYear = (refMonth < 11) ? refYear : refYear+1;
    deadline = new Date(endYear, endMonth, 25,12,0,0);
  }

  deadlineFmt += (deadline.getDate()<10) ? "0"+deadline.getDate() : deadline.getDate();
  deadlineFmt += ((deadline.getMonth()+1)<10) ? "0"+(deadline.getMonth()+1) : (deadline.getMonth()+1)
  deadlineFmt += (""+deadline.getFullYear()).substr((((""+deadline.getFullYear()).length)-2));

  // calculate the last 2 chars of reg number: sum of first 21 digits, then keep the 2 rightmost digits of the result
  paymentRegNumber = "10" + ddRule + "01" + refMonth2 + refYear2 + deadlineFmt + "0" + "000";
 
  for (i=0; i < paymentRegNumber.length; i++){
    scheduledControl = (scheduledControl + new Number (paymentRegNumber[i]));
  }

  scheduledControl = ("" + scheduledControl).substr((scheduledControl.length)-2);// string with the 2 rightmost chars of scheduledControl
  paymentRegNumber += ("" + scheduledControl);

  return paymentRegNumber;
}

function sumaControl(){
var suma = date.comert.r1.c2.rawValue  + date.comert.r2.c2.rawValue  + date.comert.r3.c2.rawValue + date.comert.r3_1.c2.rawValue + date.comert.r4.c2.rawValue + date.comert.r5.c2.rawValue + date.comert.r5.c3.rawValue + date.comert.r5_1.c2.rawValue  + date.comert.r5_1.c3.rawValue +
				date.comert.r6.c2.rawValue  + date.comert.r6.c3.rawValue  + date.comert.r7.c2.rawValue  + date.comert.r7.c3.rawValue + date.comert.r7_1.c2.rawValue + date.comert.r7_1.c3.rawValue  + date.comert.r8.c2.rawValue + date.comert.r8.c3.rawValue +
				date.livrari.r9.c2.rawValue+ date.livrari.r9.c3.rawValue + date.livrari.r9_1.c2.rawValue + date.livrari.r9_1.c3.rawValue + date.livrari.r10.c2.rawValue + date.livrari.r10.c3.rawValue + date.livrari.r10_1.c2.rawValue + date.livrari.r10_1.c3.rawValue +
				date.livrari.r11.c2.rawValue + date.livrari.r11.c3.rawValue + date.livrari.r11_1.c2.rawValue + date.livrari.r11_1.c3.rawValue + date.livrari.r12.c2.rawValue + date.livrari.r12.c3.rawValue + date.livrari.r12_1.c2.rawValue + date.livrari.r12_1.c3.rawValue +
				date.livrari.r12_2.c2.rawValue + date.livrari.r12_2.c3.rawValue +
				date.livrari.r13.c2.rawValue + date.livrari.r14.c2.rawValue + date.livrari.r15.c2.rawValue + date.livrari.r16.c2.rawValue + date.livrari.r16.c3.rawValue + date.livrari.r17.c2.rawValue + date.livrari.r17.c3.rawValue + date.livrari.r18.c2.rawValue + date.livrari.r18.c3.rawValue +
				date.livrari.r19.c2.rawValue + date.livrari.r19.c3.rawValue +
				date.achizitiiRO.r20.c2.rawValue + date.achizitiiRO.r20.c3.rawValue + date.achizitiiRO.r20_1.c2.rawValue + date.achizitiiRO.r20_1.c3.rawValue + date.achizitiiRO.r21.c2.rawValue + date.achizitiiRO.r21.c3.rawValue + date.achizitiiRO.r22.c2.rawValue + date.achizitiiRO.r22.c3.rawValue +
				date.achizitiiRO.r22_1.c2.rawValue + date.achizitiiRO.r22_1.c3.rawValue + date.achizitiiRO.r23.c2.rawValue + date.achizitiiRO.r23.c3 +
				date.achizitiiIMP.r24.c2.rawValue + date.achizitiiIMP.r24.c3.rawValue +  date.achizitiiIMP.r25.c2.rawValue + date.achizitiiIMP.r25.c3.rawValue  +
				date.achizitiiIMP.r27.c2.rawValue + date.achizitiiIMP.r27.c3.rawValue + date.achizitiiIMP.r27_1.c2.rawValue + date.achizitiiIMP.r27_1.c3.rawValue +
				date.achizitiiIMP.r27_2.c2.rawValue + date.achizitiiIMP.r27_2.c3.rawValue    +
				date.achizitiiIMP.r28.c3.rawValue + date.achizitiiIMP.r29.c3.rawValue + date.achizitiiIMP.r30.c2.rawValue + date.achizitiiIMP.r30_1.c2.rawValue + date.achizitiiIMP.r31.c2.rawValue + date.achizitiiIMP.r31.c3.rawValue +
				date.achizitiiIMP.r32.c3.rawValue + date.achizitiiIMP.r33.c3.rawValue + date.achizitiiIMP.r34.c2.rawValue + date.achizitiiIMP.r34.c3.rawValue + date.achizitiiIMP.r35.c3.rawValue + date.achizitiiIMP.r36.c3.rawValue +
				date.regularizari.r37.c3.rawValue + date.regularizari.r38.c3.rawValue + date.regularizari.r39.c3.rawValue + date.regularizari.r40.c3.rawValue + date.regularizari.r41.c3.rawValue + date.regularizari.r42.c3.rawValue + date.regularizari.r43.c3.rawValue +
				date.regularizari.r44.c3.rawValue + date.regularizari.r45.c3.rawValue + date.regularizari.r46.c3.rawValue +
				date.r47.c1.rawValue + date.r47.c2.rawValue + date.r47.c3.rawValue + date.r48.c1.rawValue + date.r48.c2.rawValue + date.r48.c3.rawValue;
				
return suma;
}					
