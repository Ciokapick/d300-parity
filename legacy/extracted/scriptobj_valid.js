//valideaza IBAN
function isIban(value) {
    var lengthMap = getLengthMap();
    //cleanup  
    //value = value.toString().toUpperCase().replace(/\s/g, '').replace(/[-]/g, '');
	value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    //check if alphanumeric
    if (!/^[a-zA-Z0-9]+$/.test(value)) return false;
    //extract countrycode
    var countryCode = value.substring(0, 2);
        //app.alert(countryCode);
    //check if letter
    if (!/([a-z]+[\s\-]?)*/i.test(countryCode)) return false;
    //Check that the total IBAN length is correct as per the country
    if (value.length != lengthMap[countryCode]) return false;
	//Move the four initial characters to the end of the string
    value = value.concat(value.substring(0, 4)).substring(4);
    //Replace the letters in the string with digits
    value = value.replace(/[A-Z]/g,function (letter) {
      return letter.charCodeAt(0) - 55;
    });

        //app.alert(value);
    //validate checksum    
    return modulo(value, 97) == 1;
    

    function modulo(divident, divisor) {
        var quantization = 12;
        while (quantization < divident.length) {
            var part = divident.substring(0, quantization);
            divident = (part % divisor) + divident.substring(quantization);
        }
        return divident % divisor;
    }

    function getLengthMap() {
        var lengthMap = {};
        //IBAN Countries
        lengthMap["AD"] = 24;//Andorra
        lengthMap["AL"] = 28;//Albania
        lengthMap["AT"] = 20;//Austria
        lengthMap["AZ"] = 28;//Azerbaijan
        lengthMap["BH"] = 22;//Bahrain
        lengthMap["BE"] = 16;//Belgium
        lengthMap["BA"] = 20;//Bosnia and Herzegovina
        lengthMap["BR"] = 29;//Brazil
        lengthMap["BG"] = 22;//Bulgaria
        lengthMap["CR"] = 21;//Costa Rica
        lengthMap["HR"] = 21;//Croatia
        lengthMap["CY"] = 28;//Cyprus
        lengthMap["CZ"] = 24;//Czech Republic
        lengthMap["DK"] = 18;//Denmark
        lengthMap["DO"] = 28;//Dominican Republic
        lengthMap["EE"] = 20;//Estonia
        lengthMap["FO"] = 18;//Faroe Islands
        lengthMap["FI"] = 18;//Finland
        lengthMap["FR"] = 27;//France
        lengthMap["GE"] = 22;//Georgia
        lengthMap["DE"] = 22;//Germany
        lengthMap["GI"] = 23;//Gibraltar
        lengthMap["GR"] = 27;//Greece
        lengthMap["GL"] = 18;//Greenland
        lengthMap["GT"] = 28;//Guatemala
        lengthMap["HU"] = 28;//Hungary
        lengthMap["IS"] = 26;//Iceland
        lengthMap["IE"] = 22;//Ireland
        lengthMap["IL"] = 23;//Israel
        lengthMap["IT"] = 27;//Italy
        lengthMap["JO"] = 30;//Jordan
        lengthMap["KZ"] = 20;//Kazakhstan
        lengthMap["XK"] = 20;//Kosovo
        lengthMap["KW"] = 30;//Kuwait
        lengthMap["LV"] = 21;//Latvia
        lengthMap["LB"] = 28;//Lebanon
        lengthMap["LI"] = 21;//Liechtenstein
        lengthMap["LT"] = 20;//Lithuania
        lengthMap["LU"] = 20;//Luxembourg
        lengthMap["MK"] = 19;//Macedonia
        lengthMap["MT"] = 31;//Malta
        lengthMap["MR"] = 27;//Mauritania
        lengthMap["MU"] = 30;//Mauritius
        lengthMap["MD"] = 24;//Moldova
        lengthMap["MC"] = 27;//Monaco
        lengthMap["ME"] = 22;//Montenegro
        lengthMap["NL"] = 18;//Netherlands
        lengthMap["NO"] = 15;//Norway
        lengthMap["PK"] = 24;//Pakistan
        lengthMap["PS"] = 29;//Palestine
        lengthMap["PL"] = 28;//Poland
        lengthMap["PT"] = 25;//Portugal
        lengthMap["QA"] = 29;//Qatar
        lengthMap["RO"] = 24;//Romania
        lengthMap["LC"] = 32;//Saint Lucia
        lengthMap["SM"] = 27;//San Marino
        lengthMap["ST"] = 25;//Sao Tome and Principe
        lengthMap["SA"] = 24;//Saudi Arabia
        lengthMap["RS"] = 22;//Serbia
        lengthMap["SC"] = 31;//Seychelles
        lengthMap["SK"] = 24;//Slovak Republic
        lengthMap["SI"] = 19;//Slovenia
        lengthMap["ES"] = 24;//Spain
        lengthMap["SE"] = 24;//Sweden
        lengthMap["CH"] = 21;//Switzerland
        lengthMap["TL"] = 23;//Timor-Leste
        lengthMap["TN"] = 24;//Tunisia
        lengthMap["TR"] = 26;//Turkey
        lengthMap["UA"] = 29;//Ukraine
        lengthMap["AE"] = 23;//United Arab Emirates
        lengthMap["GB"] = 22;//United Kingdom
        lengthMap["VG"] = 24;//Virgin Islands, British
        //Partial IBAN Countries (Experimental)
		lengthMap["DZ"] = 24;//Algeria
		lengthMap["AO"] = 25;//Angola
		lengthMap["BJ"] = 28;//Benin
		lengthMap["BF"] = 28;//Burkina Faso
		lengthMap["BI"] = 16;//Burundi
		lengthMap["CM"] = 27;//Cameroon
		lengthMap["CV"] = 25;//Cape Verde
		lengthMap["CF"] = 27;//Central African Republic
		lengthMap["TD"] = 27;//Chad
		lengthMap["KM"] = 27;//Comoros
		lengthMap["CG"] = 27;//Congo
		lengthMap["DJ"] = 27;//Djibouti
		lengthMap["EG"] = 27;//Egypt
		lengthMap["GQ"] = 27;//Equatorial Guinea
		lengthMap["GA"] = 27;//Gabon
		lengthMap["GW"] = 25;//Guinea-Bissau
		lengthMap["IR"] = 26;//Iran
		lengthMap["IQ"] = 23;//Iraq
		lengthMap["CI"] = 28;//Ivory Coast
		lengthMap["MG"] = 27;//Madagascar
		lengthMap["ML"] = 28;//Mali
		lengthMap["MA"] = 28;//Morocco
		lengthMap["MZ"] = 25;//Mozambique
		lengthMap["NE"] = 28;//Niger
		lengthMap["SN"] = 28;//Senegal
		lengthMap["TG"] = 28;//Togo			
        return lengthMap;
    }
}

//valideaza NUI AMEF. Intoarce:
    //  -1 - cifra control eronata
    //  0 - cifra control corecta
    // nui trebuie sa aiba 10 caractere numerice
 
function isNuiAmef(val){
	var ponderiCifraControl = [7, 8, 6, 2, 1, 3, 4, 5, 9];
	var rest =  0;
	var cifraControl = 0;
	var reg = /^\d+$/;
	if (val.length != 10) return -1;// strict 10 caractere
	if (reg.test(val) == false)return -1;// strict caractere numerice
	for (var i = 0; i < 9 ; i ++){
		rest = val % 10;  
		val = parseInt(val / 10); 
		if (rest >= 5) val++;
		cifraControl += rest * ponderiCifraControl[i];
	}
	if (rest >= 5 ) val--;
	cifraControl = 1 + cifraControl % 9;
	if(val != cifraControl) return -1;
	return 0;
}

//valideaza CNP
function isCNP( p_cnp ) {
    var i = 0 , year = 0 , day , month , hashResult = 0 , cnp = [] , hashTable = [2,7,9,1,4,6,3,5,8,2,7,9];
    if( p_cnp.length !== 13 ) { return false; }
    for( i = 0 ; i < 13 ; i++ ) {
        cnp[i] = parseInt( p_cnp.charAt(i) , 10 );
        if( isNaN( cnp[i] ) ) { return false; }
        if( i < 12 ) { hashResult = hashResult + ( cnp[i] * hashTable[i] ); }
    }
    hashResult = hashResult % 11;
    if( hashResult === 10 ) { hashResult = 1; }
    year = (cnp[1]*10)+cnp[2]; 
    month = (cnp[3] * 10) + cnp[4];
    day = cnp[5] * 10 + cnp[6];
 	if(month == 0 || month > 12 || day == 0 / day > getDaysInMonth(month, year)
            || (month == 2 && day == 29 && ((year % 4) != 0
            || ((year % 100) == 0 && (year % 400) != 0)))){ return false; }
    switch( cnp[0] ) {
        case 1  : case 2 : { year += 1900; } break;
        case 3  : case 4 : { year += 1800; } break;
        case 5  : case 6 : { year += 2000; } break;
        case 7  : case 8 : case 9 : { year += 2000; if( year > ( parseInt( new Date().getYear() , 10 ) - 14 ) ) { year -= 100; } } break;
        default : { return false; }
    }
    if( year < 1800 || year > 2099 ) {return false;  }
    

    return ( cnp[12] === hashResult );
}

function getDaysInMonth(m, y) {
  // return /4|6|9|11/.test(m)? 30:m==2?(!(y%4)&&y%100)||!(y%400)? 29:28:31;
  if (m == 4 || m == 6 || m == 9 || m == 11){return 30;}
	else if (m == 2){
				if ((!(y%4)&&y%100)||!(y%400)){ return 29;}
					else {return 28;}
					}
	else {return 31;}
}

// valideaza cnpNif
function isCnpNif( p_cnpNif ) {
	var i = 0, hashResult = 0, cnpNif = [], hashTable = [2,7,9,1,4,6,3,5,8,2,7,9], chk;
	if( p_cnpNif.length !== 13 ) { return false; }
	chk = parseInt(p_cnpNif.charAt(0), 10);
	if( isNaN( chk ) ) { return false; }
	if (chk == 9){
		for( i = 0 ; i < 13 ; i++ ) {
       	 cnpNif[i] = parseInt( p_cnpNif.charAt(i) , 10 );
        	if( isNaN( cnpNif[i] ) ) { return false; }
        	//if (cnpNif[0] == 9){
        	if( i < 12 ) { hashResult = hashResult + ( cnpNif[i] * hashTable[i] );}
        	//}
    	}
    	hashResult = hashResult % 11;
    	if( hashResult === 10 ) { hashResult = 1; }
		if( cnpNif[12] !== hashResult ){ return false; }
  }
  else {return isCNP(p_cnpNif);}
}

//valideaza CUI
function strReverse(str){
	var splitext = str.split("");
	var revertext = splitext.reverse();
	var reversed = revertext.join("");
	return reversed;
}


function isNumeric(sText)
{
   var ValidChars = "0123456789";
   var IsNumber = true;
   var Char;
 
   for (i = 0; i < sText.length && IsNumber == true; i++) { 
      Char = sText.charAt(i); 
      if (ValidChars.indexOf(Char) == -1) {
         IsNumber = false;
      }
   }
   return IsNumber;
}
 
function isCUI(p_cui){
	if (!isNumeric(p_cui)){
		return false;
	}
	if(p_cui.charAt(0)=="0"){
	app.alert("Primul caracter al unui Cod Unic de Identificare nu poate fi 0(zero)!\n\nCorectati valoarea introdusa...");
	return false;
	}
	
	var key ="753217532";
	key = strReverse(key);

	var cuirev = strReverse("" + p_cui.valueOf()) ;
	var control = cuirev.substring(0, 1);
	cuirev = cuirev.substring(1);
	
	var length = cuirev.length ;
	var suma = 0;

	for (var i = 0; i < length; i++)
	{
	suma += parseInt(cuirev.charAt(i),10) * parseInt(key.charAt(i),10);
	}
    suma *= 10;
    return ((((suma%11) == 10)&&(control =="0"))||(((suma%11) != 10)&&((suma%11).toString() == control))) ? true : false;
}


function isValidIBANNumber(input) {
     var CODE_LENGTHS = {
		AL: 28, BY: 28, TL: 23, GE: 22, XK: 20, VG: 24, LC: 32, ST: 25,
        AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
        CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
        FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
        HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
        LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
        MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
        RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26
    };
    var iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, ''), // keep only alphanumeric characters
            code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/), // match and capture (1) the country code, (2) the check digits, and (3) the rest
            digits;
    // check syntax and length
    if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
        return false;
    }
    // rearrange country code and check digits, and convert chars to ints
    digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter) {
        return letter.charCodeAt(0) - 55;
    });
    // final check
    return mod97(digits);
}
function mod97(string) {
    var checksum = string.slice(0, 2), fragment;
    for (var offset = 2; offset < string.length; offset += 7) {
        fragment = String(checksum) + string.substring(offset, offset + 7);
        checksum = parseInt(fragment, 10) % 97;
    }
    return checksum;
}

