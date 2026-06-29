function hik()
 {
  x=66;
  return String.fromCharCode(x-2);
 }
function hip(a1, a2, a3, a4)
 {
  x=110;
  document.write("<a href='ma");
  document.write(String.fromCharCode(x-5, x-2));
  document.write("to");
  document.write(String.fromCharCode(x-52));
  document.write(a2+hik()+a3+"."+a1);
  if (a4!=null)
    document.write("?subject="+a4);
  document.write("'>");
  document.write(a2+hik()+a3+"."+a1);
  document.write("</a>");
 }
