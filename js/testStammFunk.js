  "use strict";
  $.extend({
    getUrlVars: function(){
      var vars = [], hash;
      var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      for(var i = 0; i < hashes.length; i++)
      {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
      }
      return vars;
    },
    getUrlVar: function(name){
      return $.getUrlVars()[name];
    }
  });

  
  var richtige = 0; //doch noch ne globale
  //direkt mit ausgabe um die breite des Funktionstextes zu ermitteln  
  function createAufgaben(anzahl,grad,bruch,parameter,lsg)
  {//bruch - bruch möglich, parameter, parameter möglich also ein a oder b nachdem nicht differenziert wird
    var maxWidth = 0;
    $('#divOutput').html("<form id='formAufgaben'>");
    for (var i=0; i < anzahl; ++i)
    {
      var totalText = '';
      var funcText = "";
      var coeffArray=new Array();
      var parameterArray = new Array();
      var coeffFound=false;
      var realGrad = grad;
      
      for (var j=0 ; j<= grad; j++)
      {
        var coeff = Math.floor(Math.random()*20) - 10 ;
        if (Math.random() < 0.3 && coeff != 0) //0 ein wenig erhoehen
        {
          coeff = 0;
        }
        else if (Math.random() < 0.2 && bruch) // bruch einbauen
        {
          var z = Math.floor(Math.random()*20) - 10;
          if (z==0)
            coeff = 0; 
          else
          {
            var n = Math.abs(coeff);
            if (n==0)
              n=2;
            if ( n == 1) //eintel doof
              coeff = z;
            else if ( Math.abs(z)==n )
              coeff = 1;
            else
              coeff = z+"/"+n;
          }            
        }
        //polynomial so zu veraendern, dass parameter moeglich sind ist zu aufwendig
        if (coeff != 0 && Math.random() < 0.2 && parameter)
        {
          //erzeuge parameter
          var par = Math.floor(Math.random()*5); //parameter a - e
          parameterArray[j] = String.fromCharCode(97+par);
        }
        else
          parameterArray[j]='';
        coeffArray.push(coeff);
      }
      //jetzt die Ausgabe
      var poly = new Polynomial(coeffArray);
      funcText = 'f(x) = ' + generateAnzeige(poly,parameterArray,true); //true beautify 

      
      //loesung erzeugen, normal nicht angezeigt
      // console.log("Polynom:   " + pSol.toString());
      var pSol = poly.integrate(1);
      var parameterArraySol = parameterArray.slice();
      parameterArraySol.unshift(1); //Integral
      // console.log('abl coeff: ' + pSol.coeff.toSource());
      // console.log('abl para : ' + parameterArraySol);

      var anzeigeSol = "<div id='divSol"+i+"' class='spoiler'> F(x) = " + generateAnzeige(pSol,parameterArraySol,true)+'</div>';
      
      //Funktion zusammengebaut
      // console.log("i ist " + i);
      totalText+='<fieldset><span class="spanFunk" id="f'+i+ '">' + funcText+'</span>'; //Funktion
      totalText+='<label for="fs' +i + '">Stammfunktion: </label>'; //beschriftung
      totalText+='<input class="inLsg" id="fs' + i + '"></input>';
      totalText+='<button type="button" class="bCheck" id="bCheck'+i+'">check</button>';
      if (lsg)
        totalText += '<button type="button" class="bSpoil" id="bSpoil'+i+'">spoil</button>';
      totalText+='<img id="fsres'+i+ '" src="icons/help-icon.png">';
      if (lsg)
        totalText += '<br>' + anzeigeSol;
      totalText+='</fieldset>';
      $('#formAufgaben').append(totalText);
      var width = $('#f'+i).width();
      $('#bCheck'+i).data("coeffArray",coeffArray).data("parameterArray",parameterArray).data("grad",realGrad).data("number",i);
      $('#bSpoil'+i).data("coeffArray",coeffArray).data("number",i);
            
      // console.log("have coeffArray"+ coeffArray+ " and para: " + parameterArray + " mit len " + parameterArray.length);

      maxWidth = width > maxWidth ? width : maxWidth;
    }
    $('#divOutput').append('</form>');
    // console.log("maxwidth is  " + maxWidth);
    $('.spanFunk').each(
      function()
      {
        $(this).width(maxWidth+20);
      });    
  }

  
  //daemlich hochzeichen raus, klammern und leerzeichen raus
  //entferne Parameter, erzeuge array mit coeffizienten und array mit parametern
  function prepareAnswer(ans)
  {
    var coeffArray = new Array();
    var parameterArray = new Array();
    var ansTmp = "";
    ans = ans.replace(/\(|\)| /g,"");    
    ans = ans.toLowerCase();     
    while (ans.indexOf("--")>-1 || ans.indexOf("-+")>-1 || ans.indexOf("++")>-1 )
    {  
      ans = ans.replace(/\-\+/g,"-"); 
      ans = ans.replace(/\-\-/g,"+"); 
      ans = ans.replace(/\+\+/g,"+");
      // console.log(ans);
    }
    ans = ans.replace(/\-/g,"+-");  //damit der split funktioniert, brauche - beim koeffizienten
    ans = ans.replace(/^\+/,"");
    for (var i = 0; i < ans.length; ++i)//sonderzeichen hochgestellt entfernen
    {
      var c = ans.charCodeAt(i);      
      if (c < 123)
      {
        ansTmp += ans[i];
      }
      else if (c >= 8308 && c <= 8313) // hoch 4 die 4 ist 52 
      {
        c-= 8256
        ansTmp+="^"; 
        ansTmp += String.fromCharCode(c);
      }
      else if (c == 178 || c==179) //hoch 2 hoch 3, 2 ist die 50
      {
        ansTmp += "^";
        ansTmp += String.fromCharCode(c-128);
      }//sonst nix, weglassen
    }

    //erzeuge ein Array aus den bestandteilen
    //vereinfachter "parser"
    
    var coeffTmp = ansTmp.split(/[\+]/g);
    //koeffizienten array und parameter array erzeugen
    for (var i = 0; i < coeffTmp.length; ++i)
    {
      //teilausdruck *x^irgendwas suchen
      var patternExpo = /\**x\^[1-9][0-9]*/ig ; //n mal *, dann x^
      var patternX = /\**x/ig ; 
      var resExpo = patternExpo.exec(coeffTmp[i]);
      var resX = patternX.exec(coeffTmp[i]); 
      var expo = 0;
      if (resExpo)
      {
        expo = eval(resExpo[0].split('^')[1]);
        coeffArray[expo]=coeffTmp[i].replace(resExpo[0],""); //und loeschen
      }
      else if (resX)
      {
        expo = 1
        coeffArray[expo] = coeffTmp[i].replace(resX[0],""); //und loeschen                 
      }
      else //kein x
      {
        expo = 0;
        coeffArray[expo] = coeffTmp[i];        
      }
      if (coeffArray[expo] == "" && expo != 0)
        coeffArray[expo] = "1";
      if (coeffArray[expo]=='-')
        coeffArray[expo]='-1';

      // console.log("coeffArray " + expo + "mit para: " + coeffArray[expo]);
      //coeffArray ist da, aber es sind noch die parameter drin 
      //lösche Parameter und merke sie mir, exemplarische Fälle   a  2a    a2   2a4    a*2   2*a   2a*4   2*a4    2*a*4 
      var pos=-1;                                              //*1* 2*1* *1*2  2*1*4  *1**2 2**1* 2*1**4 2*1*4  2**1**4
      if ((pos = coeffArray[expo].search(/[a-w]/)) > -1) //> hat prio vor = ?
      {
        parameterArray[expo]=coeffArray[expo][pos]; //found
        coeffArray[expo] = coeffArray[expo].replace(/[a-w]/g,"*1*"); //a  ist weg
        coeffArray[expo] = coeffArray[expo].replace(/\*\*/g,"*");   //evtl ** weg
        coeffArray[expo] = coeffArray[expo].replace(/^\*+|\*+$/g,''); //* am Anfang / Ende
        coeffArray[expo] = coeffArray[expo].replace(/^\-\*+/g,'-'); //-* am Anfang / Ende
      }
      else 
        parameterArray[expo]=''; //kein string    
      for (var j=0; j  < coeffArray.length; ++j)
      {
        if (typeof (coeffArray[j]) == "undefined")
          coeffArray[j] = 0;
        if (typeof (parameterArray[j]) == "undefined")
          parameterArray[j] = ''; //kein string hier besser         
      }
    }
    //console.log("have coeffArray"+ coeffArray+ " and para: " + parameterArray + " mit len " + parameterArray.length);
    return {c: coeffArray, p: parameterArray};
  }
  
  //vergleiche zwei polynome in paraA/B stehen die parameter
  function compare(a,b,paraA,paraB)
  {
    //console.log("compare mit arrays " + paraA + " und " + paraB);
    if (a.degree() != b.degree()) //echter Grad wird genommen also coeff 0 -> grad evtl. geringer
      return false; //console.log("pol1") &&  false;
    if (a.toString() != b.toString())
      return  false; //console.log("pol2") && false;
    var min = paraA.length < paraB.length ? paraA.length : paraB.length;
    for (var i = 0; i < min ; ++i)
      if (paraA[i] != paraB[i])
        return  false; //console.log("arry el "+i) &&false;
    return true;
  }


  //erzeuge aus dem Polynom und dem ParameterArray die Anzeige
  //parameterarray enthält leerzeichen und einzelne parameter
  //poly kann nur Brueche oder ganze Zahlen enthalten
  //moeglich also kombinationen  ([[0-9]+/[0-9]+]*|[0-9]*)[a-w]*x*
  //also x-> *x
  //parameter -> *parameter
  //+* und -* ersetzen
  function generateAnzeige(poly, parameterArray, beautify) 
  {
    var anzeigeArray = new Array();
    var anzeigeString = "";
    var pATmp = parameterArray.slice(); //tiefe kopie
    
    $.each(poly.coeff,function(key,value){
      key=parseInt(key);
      anzeigeArray[key] = value.toFraction();
    });
    //falls undefinierte koeffizienten
    for (var i = 0; i < anzeigeArray.length ; ++i)
      if (typeof(anzeigeArray[i])=='undefined')
        anzeigeArray[i]='0';
    // console.log("anzArray: " + anzeigeArray);
    
    for (var i = anzeigeArray.length - 1; i >= 2; --i)
    { 
      if (anzeigeArray[i]!=0)
      {
      var anzeige = anzeigeArray[i];      
      if (anzeige == '1' )
        anzeige = '';
      else if (anzeige == '-1')
        anzeige='-' //sowas wie 1d soll nicht anzeigt werden sondern dann d
      else if (beautify)
        anzeige+='&middot;'
      
      if (pATmp[i]!='' && beautify)
        pATmp[i]+='&middot';
      
      if (beautify)
        anzeigeString+='+'+anzeige+pATmp[i]+"x<sup>"+i+"</sup>";
      else
        anzeigeString+='+'+anzeige+pATmp[i]+"x^"+i;
        
      }        
    }
    if (anzeigeArray.length > 1 && anzeigeArray[1] != '0' )
    {
      var anzeige = anzeigeArray[1];
      if (anzeige == '1' )
        anzeige = '';
      else if (anzeige == '-1' )
        anzeige='-' //sowas wie 1d soll nicht anzeigt werden sondern dann d
      else if (beautify)
        anzeige += '&middot';

      if (pATmp[1]!='' && beautify)
        pATmp[1]+='&middot';
      
      anzeigeString += '+' + anzeige + pATmp[1]+"x";
    }
    
    
    if (anzeigeArray.length > 0 && anzeigeArray[0] != '0' )
    {
      var anzeige = anzeigeArray[0];
      if (anzeige == '1' && pATmp[0]!='')
        anzeige = '';
      else if (anzeige == '-1' && pATmp[0]!='')
        anzeige='-' //sowas wie 1d soll nicht anzeigt werden sondern dann d
      else if (pATmp[0]!='' && beautify)
        anzeige+='&middot;'
        
      anzeigeString += '+' + anzeige + pATmp[0];
    }
    anzeigeString = anzeigeString.replace(/^\+/,'');//+ am Anfang
    anzeigeString = anzeigeString.replace(/\+\-/g,'-'); //+- gesamt
    anzeigeString = anzeigeString.replace(/(\+|\-)/g ,' $1 '); //etwas abstand, $1 referenziert Fund der 1. Gruppierung ( )
    anzeigeString = anzeigeString.replace(/^\s\-\s/g ,'-'); //am Anfang nicht
    if (anzeigeString == '')
      anzeigeString = '0'
    return anzeigeString;     
  }  
  
  //aufruf wenn der benutzter abschickt
  function checkAnswer(obj)
  {
    //Daten der Aufgabe
    var coeffArray=obj.data("coeffArray").slice(); //das koeffizienten-Array, tiefe kopie
    var parameterArray = obj.data("parameterArray").slice(); //parameter , tiefe kopie
    
    // console.log("coeff arr    : " + coeffArray);
    // console.log("parameter arr: " + parameterArray);
    var aufgNr = obj.data("number");            //die nummer der aufgabe
    var inField=$('#fs'+aufgNr);
    var answerString = inField.val().trim();
    if (answerString.length == 0)
      answerString = '0';
    var tmpArr = prepareAnswer(answerString);      
    var parameterAnswer = tmpArr.p;     
    var tmpAnswer = "";
    for (var i = tmpArr.c.length - 1; i > 0; --i) //const. Glied ist nicht dabei 
    {
      tmpAnswer += tmpArr.c[i]+"*x^" + i + "+";
    }
    
    tmpAnswer +=0;
    // console.log("polynom Antwort    : " + tmpAnswer);
    var pAnswer = new Polynomial(tmpAnswer+tmpArr.c[0]); //fuer die Anzeige const glied dazu  
    // console.log("polynom Antwort toString: " + pAnswer.toString());
    
    //var pAnswer=new Polynomial(tmpArr.c);
    //fuege die parameter fuer die Anzeige wieder ein
    // console.log("coeff: " + pAnswer.coeff.toSource());
    var anzeigeString = generateAnzeige(pAnswer, parameterAnswer,false)
    
    //und fuer die Berechnung ohne const Glied:
    pAnswer = new Polynomial(tmpAnswer);
    
    // console.log("anzeigeString: " + anzeigeString);
    inField.val(anzeigeString);

    var pSol = new Polynomial(coeffArray);
    // console.log("Polynom:   " + pSol.toString());
    pSol = pSol.integrate(1);
    parameterArray.unshift(1);//shift -> parameter für Stammfunk 1 schieben, shift ändert array !?
    parameterArray[0] = 'egal';
    parameterAnswer[0] = 'egal'; //spielt bei der Stammfunktion keine Rolle
    
     //console.log("Stammfunk ohne Parameter: " + pSol.toString());
     //console.log("StammFunk Parameter     : " + parameterArray);
     //console.log("Antwort   ohne Parameter: " + pAnswer.toString());
     //console.log("Antwort   Parameter     : " + parameterAnswer); 
    var neuBild="icons/no-icon.png";
    if (compare(pAnswer,pSol,parameterAnswer,parameterArray)) //unshift -> parameter für Stammfunk 1 schieben
    {
      neuBild = 'icons/check-icon.png';
      $("#bCheck"+aufgNr).prop("disabled",true);
      $("#fs"+aufgNr).prop("disabled",true);
      richtige++;
      richtige = Math.round(100*richtige)/100.0;
      $("#spanCount").html(richtige);      
    }
    $('#fsres'+aufgNr).fadeOut(500, 
      function(){
        $('#fsres'+aufgNr).attr('src',neuBild).fadeIn(500)
      });        
  }
  
  $(document).ready(
  function()
  {
    var grad = $.getUrlVar("inGrad");
    var anzahl = $.getUrlVar("inAnzahl");
    var parameter = $.getUrlVar("inParameter");
    var bruch = $.getUrlVar("inBruch");
    var lsg = $.getUrlVar("inLsg");
    Polynomial.setField("Q"); //kann per Standard auf Q gesetzt werden, arbeite sowieso nicht mit kommazahlen

    parameter = (parameter == "true") ? true : false;
    bruch  = (bruch == "true") ? true : false;
    lsg  = (lsg == "true") ? true : false;

    if (typeof(grad) ==="undefined" || typeof(anzahl) === "undefined")
    { //keine Parameter uebergeben, zeige Formular fuer config
      $('#formConfig').removeClass("displayNone");
      
      $('#bConfigOk').click(function()
      {
        var grad=parseInt($('#inGrad').val());
        var anzahl=parseInt($('#inAnzahl').val());
        var bruch = $('#inBruch').prop("checked");
        var parameter = $('#inParameter').prop("checked");
        var inLsg = $('#inLsg').prop("checked");
        if (!isNaN(grad) && !isNaN(anzahl))
        { //weiterleiten, sonst halt nichts tun
          var url=window.location.href.split('?')[0];
          var href = url+("?inGrad="+grad+"&inAnzahl="+anzahl+"&inBruch="+bruch+"&inParameter="+parameter);
          href += inLsg  ? "&inLsg=true" : "";
          window.location.href=href;
        }
      });
    }
    else
    {
      $('#divOutput').html("");
      $('#divAnleitung').removeClass("displayNone");
      $('#divResults').removeClass("displayNone");
      $('#divResults').html("<div id='divInnerResult'><span id='spanCount'> 0 </span>  <span> / "+anzahl+"</span></div>");
      console.log("create " + anzahl + " Aufgaben vom Grad " + grad );
      createAufgaben(anzahl,grad,bruch,parameter,lsg);//gibt direkt aus
      //haenge event handler an jedes inputfeld
      $('#divOutput form').on('click','button.bCheck',
      function()
      {
        checkAnswer($(this));
      });
      //spoiler tut es noch nicht
      $('#divOutput form').on('click','button.bSpoil',
        function()
        {
          var nummer=$(this).data("number");
          var id = "#divSol"+nummer;
          $(id).fadeOut(500, 
            function(){
              $(id).css('visibility','visible').fadeIn(500)
              richtige-=0.7;
              richtige = Math.round(100*richtige)/100.0;
              $("#spanCount").html(richtige);      
            });        
        });
    }
  });
