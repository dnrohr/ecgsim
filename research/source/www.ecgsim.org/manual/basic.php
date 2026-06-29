<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
    <head>
        <title>ECGSIM Manual: Basic</title>        <!--META TAGS-->
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

<a href='index.php'>Introduction</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''>Basic&nbsp;Usage<img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='heart.php'>Heart</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='thorax.php'>Thorax</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='membrane.php'>TMP</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='leads.php'>Leads</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='toolbox.php'>Tools</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='focus.php'>Focus</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='options.php'>Preferences</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php'>Case&nbsp;Files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='changes.php'>Versions</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php#download'>Download&nbsp;case&nbsp;files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='update.php'>Update&nbsp;ECGSIM</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='ref.php'>Publications</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='license.php'>License&nbsp;terms</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''></div>                <!--END MANUALSIDEBAR-->
                
                <!--START TEXT-->
                
<!--START LAYOUT DIV-->
<div class="layout">
        <h1>Basic usage</h1>

        <p class="text">
            The interactive operation of ECGSIM is almost entirely mouse
            controlled. The main mouse operations are:

            <blockquote>
                <ul>
                    <li>dragging, i.e. moving the mouse while holding the mouse button down, and</li>
                    <li>clicking of either the left- or the right mouse button.</li>
                </ul>
            </blockquote>
        </p>

        <p class="text">
            The ECGSIM main window consists of four panes:

            <blockquote>
                <ul>
                    <li>the <a href="heart.php">heart pane</a> in the upper left part of the application window,</li>
                    <li>the <a href="thorax.php">thorax pane</a> in the upper right part of the application window,</li>
                    <li>the <a href="membrane.php">TMP pane</a> in the lower left part of the application window and</li>
                    <li>the <a href="leads.php">leads pane</a> in the lower right part of the application window.</li>
                </ul>
            </blockquote>
        </p>

        <p class="text">

            The boundaries between the panes may be shifted by dragging the left mouse button. For each pane
            there is a menu item on the menu bar. The options in each menu
            control what is displayed in the corresponding pane.
        </p>

        <p class="text">
            The most frequently used functions are also available from
            the tool buttons at the top of the application. To view the function
            of each button, rest the mouse cursor on the button without
            pressing any of the mouse buttons. A short text explaining the
            function of the button will appear.
        </p>

        <p class="text">
            The heart and the thorax may be rotated by right mouse button
            dragging. The default, AP view (natural frontal view),
            is restored by a double click of the left or right mouse button.
        </p>

        <p class="text">
            By clicking with the left mouse button on the heart surface
            in the <a href="heart.php">heart pane</a> the nearest node on the heart surface is
            selected. The <a href="membrane.php">TMP</a> pane shows the
            transmembrane potential at this node. <br />By means of the handlers
            (<img class="helpiconbutton" alt="" title="" src="graphics/slope.png" width=18 height=18 /> or
            <img class="helpiconbutton" alt="" title="" src="graphics/time_shift.png" width=18 height=18 />,
            see het TMP main menu) the parameters of the TMP: depolarization, duration, resting potential,
            source amplitude and slopes at that node and the region around it can be changed.
            The resulting changes are visible in the <A href="heart.php#surface_function">heart</A> pane
            if the corresponding surface function is selected.
        </p>

        <p class="text">
            The effect of these changes on the body surface potentials may be viewed in the
            <a href="leads.php">leads pane</a> and the <a href="thorax.php">thorax pane</a>. Again, for the
            thorax pane the corresponding <A href="thorax.php#surface">surface function</A> must be selected.
        </p>

        <p class="text">
            The status bar at the bottom of ECGSIM shows general information from the application.
        </p>
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

