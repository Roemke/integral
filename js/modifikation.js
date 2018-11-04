
//aendere toString Methode der Fraction Klasse
//geht, denn diese ist als prototye definiert, nicht als öffentliche Methode
  Fraction.prototype.toString = function()
  {
    return this.toFraction();
  };

  //folgendes dagegen geht nicht 
  /*
  Polynomial.prototype.parse = function(x) {
    };
    */
