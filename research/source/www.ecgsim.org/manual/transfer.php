<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
    <head>
        <title>ECGSIM Manual: Transfer function</title>        <!--META TAGS-->
        <meta http-equiv="Content-type" content="text/html; charset=iso-8859-15">
        <!--FAVICON-->
        <link rel="shortcut icon" href="../favicon.ico">
        <!--lINK TO EXTERNAL STYLE SHEET-->
        <link rel="stylesheet" type="text/css" href="../stylesheet.css">
    </head>

    <body>
        
        <!--START LAYOUT DIV-->
<div class="layout">
<!--START LOGOTYPE MET LINK NAAR HOMEPAGE-->
        <a name="top"></a><a href="../index.php"><img src="../graphics/logotype.png" id="logo" alt="To the Homepage" title="To the Homepage"></a>

        <!--END LOGOTYPE-->

                    <!--START HEADERBAR-->
                    <!-- DE HEADERBAR IS HET BOVENSTE HORIZONTALE NAVIGATIEMENU -->
<p>
<div class="headerbar">

<a href='../index.php'>HOME</a> <img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='../introduction.php'>INTRODUCTION</a> <img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='../downloads/'>DOWNLOADS</a> <img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''>MANUAL<img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='../aboutus.php'>ABOUT&nbsp;US</a> 
</div>

                    <!--END HEADERBAR-->

                                <!--START MANUALSIDEBAR-->
                <div class="submenu">

<a href='index.php'>Introduction</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='basic.php'>Basic&nbsp;Usage</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='heart.php'>Heart</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='thorax.php'>Thorax</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='membrane.php'>TMP</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='leads.php'>Leads</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='toolbox.php'>Tools</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='focus.php'>Focus</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='options.php'>Preferences</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php'>Case&nbsp;Files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='changes.php'>Versions</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php#download'>Download&nbsp;case&nbsp;files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='update.php'>Update&nbsp;ECGSIM</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='ref.php'>Publications</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='license.php'>License&nbsp;terms</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''></div>                <!--END MANUALSIDEBAR-->
                
                <!--START TEXT-->
                
<!--START LAYOUT DIV-->
<div class="layout">
        <H2>Transfer function </H2>

        <p class="text">
            The source model implied in ECGSIM is the Equivalent Double Layer (EDL) type of
            surface source model (see <A href="ref.php">references</A> section). Accordingly, the
            potential <em>V(y, t)</em> at position y on the body surface at time t is given by
        </P>

        <p class="text">
            <blockquote>
                <em>V(y,t) = int A(x,y) S(x,t)</em>
            </blockquote>
        </P>

        <p class="text">
            where 'int' denotes the integral over the surface of the ventricular (or atrial)
            myocardium, <!--<em>-->S(x,t)<!--</em>--> the
            transmembrane potential at position x at the surface of the ventricular
            myocardium at time t, and <!--<em>-->A(x,y)<!--</em>--> the <EM>transfer function</EM>.
        </P>

        <p class="text">
            The transfer function quantifies the (passive) electric volume conductor properties of
            the thorax. Its values follows from the laws of electric current flow. The transfer
            function used in ECGSIM has been computed for a heart-thorax model, including
            the inhomogeneities caused by the higher conductivity of blood in the cavities
            and the lower conductivity of the lungs. The relevant geometry is derived from
            the MRI data of the subject whose reference ECG is involved.
        </P>

        <p class="text">
            The transfer function <!--<em>-->A(x,y)<!--</em>--> can be displayed on both the 
            heart (<!--<em>-->x<!--</em>-->) and the thorax (<!--<em>-->y<!--</em>-->), in µV/cm²:
        </P>

        <p class="text">
            <UL>
                <LI>
                    If you want to display the transfer function on the heart surface (atrial or ventricular), you
                    first have to select a node on the thorax. The function displayed (a row of
                    the transfer matrix) is the transfer from all points on the heart surface to
                    the selected node on the thorax. This function can be interpreted as the
                    amount by which the (local) source elements of the heart surface contribute to the
                    ECG at the node selected on the thorax.<BR/><BR/>
                <LI>
                    If you want to display the transfer function on the thorax, you first have
                    to select a node on the heart surface. The function displayed (a column of the
                    transfer matrix) is the transfer to all points on the thorax from the node
                    selected on the heart surface. It can be interpreted as the amount by which
                    the (single)  EDL source element at the selected node on the heart surface
                    contributes to the potential on the body surface.
                </LI>
            </UL>
        </P>
</div>
<!--END LAYOUT DIV-->
                    <!--END TEXT-->
                                    <!--START FOOTERNAVIGATIONBAR-->
                    <div class="footerbar">


&nbsp;<a href='../index.php'>HOME</a>&nbsp;&nbsp;&nbsp;<a href='../contact.php'>CONTACT&nbsp;US</a>&nbsp;&nbsp;&nbsp;<a href='#top'>TOP OF THIS PAGE</a>&nbsp;

</div>
                    <!--END FOOTERNAVIGATIONBARBAR-->
</div>
                        
        <!--END LAYOUT DIV-->
    </body>
</html>