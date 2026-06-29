<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">

<head>
<title>ECGSIM Downloads: Geometry files for ECGSIM 1.3</title>
<!--META TAGS-->
<meta http-equiv="Content-type" content="text/html; charset=iso-8859-15">
<!--FAVICON-->
<link rel="shortcut icon" href="favicon.ico">
<!--lINK TO EXTERNAL STYLE SHEET-->
<link rel="stylesheet" type="text/css" href="../../stylesheet.css">
</head>

<body>

<!--START LOGOTYPE-->
<a name="top"></a><a href="../../index.php"><img src="../../graphics/logotype.png" style="width:501px;height:84px;" alt="ECGSIM"></a>
<!--END LOGOTYPE-->

<!--START LAYOUT TABLE-->
<table class="layout" cellpadding="0" cellspacing="0">
<tr>
<td class="layout" colspan="2">
<!--START HEADERBAR-->
<div class="headerbar">


&nbsp;<a href='../../index.php'>HOME</a>&nbsp;&nbsp;&nbsp;<a href='../../introduction.php'>INTRODUCTION</a>&nbsp;&nbsp;&nbsp;DOWNLOADS&nbsp;&nbsp;&nbsp;<a href='../../manual/index.php'>MANUAL</a>&nbsp;&nbsp;&nbsp;<a href='../../aboutus.php'>ABOUT&nbsp;US</a>&nbsp;&nbsp;&nbsp;<a href='../../sitemap.php'>SITEMAP</a>&nbsp;
</div>
<!--END HEADERBAR-->
</td>
</tr>

<td class="layout" style="vertical-align:top;">
<!--START TEXT-->

<h1>
Download geometry files for ECGSIM 1.3
</h1>

From here the geometry descriptions of the heart, the thorax and some other
geometries used in ecgsim can be downloaded:

<ul>
<li> <a href="geometry/heart.tri">heart.tri</a>
<li> <a href="geometry/thorax.tri">thorax.tri</a>
<li> <a href="geometry/rlung.tri">rlung.tri</a>
<li> <a href="geometry/llung.tri">llung.tri</a>
<li> <a href="geometry/lcav.tri">lcav.tri</a>
<li> <a href="geometry/rcav.tri">rcav.tri</a>
<li> <a href="geometry/wct.tra">wct.tra</a>
</ul>
<p>
The format of the .tri files is as follows:
<p>

<table>
<tr>
<td><font color="#888800"> npnt
</tr>
<tr>
<td><font color="#888800"> 1
<td><font color="#888800"> x(1)
<td><font color="#888800"> y(1)
<td><font color="#888800"> z(1)
</tr>
<tr>
<td><font color="#888800"> 2
<td><font color="#888800"> x(2)
<td><font color="#888800"> y(2)
<td><font color="#888800"> z(2)
</tr>
<tr>
<td><font color="#888800"> .
<td><font color="#888800"> .
<td><font color="#888800"> .
<td><font color="#888800"> .
</tr>
<tr>
<td><font color="#888800"> .
<td><font color="#888800"> .
<td><font color="#888800"> .
<td><font color="#888800"> .
</tr>
<tr>
<td><font color="#888800"> npnt
<td><font color="#888800"> x(npnt)
<td><font color="#888800"> y(npnt)
<td><font color="#888800"> z(npnt)
</tr>
<tr>
<td><font color="#888800"> ntri
</tr>
<tr>
<td><font color="#888800"> 1
<td><font color="#888800"> ind(1,1)
<td><font color="#888800"> ind(1,2)
<td><font color="#888800"> ind(1,3)
</tr>
<tr>
<td><font color="#888800"> 2
<td><font color="#888800"> ind(2,1)
<td><font color="#888800"> ind(2,2)
<td><font color="#888800"> ind(2,3)
</tr>
<tr>
<td><font color="#888800"> .
<td><font color="#888800"> .
<td><font color="#888800"> .
<td><font color="#888800"> .
</tr>
<tr>
<td><font color="#888800"> .
<td><font color="#888800"> .
<td><font color="#888800"> .
<td><font color="#888800"> .
</tr>
<tr>
<td><font color="#888800"> ntri
<td><font color="#888800"> ind(ntri,1)
<td><font color="#888800"> ind(ntri,2)
<td><font color="#888800"> ind(ntri,3)
</tr>
</table>

<p>
where npnt is the number of vertices, x(i), y(i) and z(i) are the coordinates
(in meters) of vertex i, ntri is the number of triangles, and ind(j,1), ind(j,2) and
ind(j,3) are the indices of the vertices of triangle j. The order of the
indices for a triangle defines the orientation of the triangle; seen from the
outside the vertices are number clockwise.


<p>
The format of the .tra (transfer matrix) file is as follows:
<p>

<table>
<tr>
<td><font color="#888800"> nrow ncol
</tr>
<tr>
<td><font color="#888800"> tra(1,1)
<td><font color="#888800"> tra(1,2)
<td><font color="#888800"> ...
<td><font color="#888800"> tra(1,ncol)
</tr>
<tr>
<td><font color="#888800"> tra(2,1)
<td><font color="#888800"> tra(2,2)
<td><font color="#888800"> ...
<td><font color="#888800"> tra(2,ncol)
</tr>
<tr>
<td><font color="#888800"> .
<td><font color="#888800"> .
<td><font color="#888800"> .
<td><font color="#888800"> .
</tr>
<tr>
<td><font color="#888800"> .
<td><font color="#888800"> .
<td><font color="#888800"> .
<td><font color="#888800"> .
</tr>
<tr>
<td><font color="#888800"> tra(nrow,1)
<td><font color="#888800"> tra(nrow,2)
<td><font color="#888800"> ...
<td><font color="#888800"> tra(row,ncol)
</tr>
</table>

<p>
where tra(i,j) is the potential generated at vertex i of the thorax by a unit
double layer source at vertex j of the mycardial surface.
<br>
Line breaks are inserted to improve readibility, but are not
essential.
<!--END TEXT-->
</td>
</tr>

<tr>
<td class="layout" style="vertical-align:top;" colspan="2">
<!--START IMAGE-->
<img src='../../pictures/horizontaal/IMG_8432.jpg' alt='' class='illustration'>
<!--END IMAGE-->
</td>
</tr>

<tr>
<td class="layout" colspan="2">
<!--START FOOTERNAVIGATIONBAR-->
<div class="footerbar">


&nbsp;<a href='../../index.php'>HOME</a>&nbsp;&nbsp;&nbsp;<a href='../../contact.php'>CONTACT&nbsp;US</a>&nbsp;&nbsp;&nbsp;<a href='#top'>TOP OF THIS PAGE</a>&nbsp;
</div>
<!--END FOOTERNAVIGATIONBARBAR-->
</td>
</tr>
</table>
<!--END LAYOUT TABLE-->
</body>
</html>