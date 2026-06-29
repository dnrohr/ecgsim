<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
    <head>
        <title>ECGSIM Manual: Alternative Geometry</title>        <!--META TAGS-->
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

<a href='index.php'>Introduction</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='basic.php'>Basic&nbsp;Usage</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='heart.php'>Heart</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='thorax.php'>Thorax</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='membrane.php'>TMP</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='leads.php'>Leads</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='toolbox.php'>Tools</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='focus.php'>Focus</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''>Preferences<img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php'>Case&nbsp;Files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='changes.php'>Versions</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php#download'>Download&nbsp;case&nbsp;files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='update.php'>Update&nbsp;ECGSIM</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='ref.php'>Publications</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='license.php'>License&nbsp;terms</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''></div>                <!--END MANUALSIDEBAR-->
                
                <!--START TEXT-->
                
<!--START LAYOUT DIV-->
<div class="layout">
        <H1>Preferences</H1>

        <UL class="helpmenu">
            <LI> <A href="#color">Color scale</A>
            <LI> <A href="#grid">Grid</A>
            <LI> <A href="#isofunction">Thorax &#47; heart settings</A>
            <LI> <A href="#handlers">TMP handlers</A>
            </LI>
        </UL>

        <p class="text">
            This dialog can be opened by pressing the <tt>-preferences-</tt> item. For Windows this item is
            located in the <tt>-Options-</tt> main menu item. While this dialog is being shown the rest of
            the application cannot be accessed.
        </p>

        <p class="text">
            <IMG alt="" class="helpimage" title="" src="graphics/ECGsimoptions.PNG" />
        </P>
        

        <A id=color name=color></A>
        <H2>Color scale</H2>

        <p class="text">
            Color coding scales are used to visualize surface functions in the <A href="heart.php">heart</A>
            view and <A href="thorax.php">thorax</A> view. The used color scale can be adjusted for
            three types of functions:
            <blockquote>
                <ul>
                    <li>
                        timing, used when visualizing <tt>depolarization</tt>, <tt>repolarization</tt> and
                        <tt>ARI</tt> on the <A href="heart.php#surface_function">heart</A>,
                    </li>
                    <li>
                        potential, used when visualizing <tt>heart contribution</tt> and <tt>potential field</tt>
                        on the <A href="heart.php#surface_function">heart</A> and all surface functions in the
                        <A href="thorax.php#surface">thorax</A> and the
                    </li>
                    <li>
                        TMP, used when visualizing <tt>amplitude</tt>, <tt>resting potential</tt> and <tt>TMP</TT>
                        on the <A href="heart.php#surface_function">heart</A>.
                    </li>
                </ul>
            </blockquote>
        </P>

        
        <A id=grid name=grid></A>
        <H2>Grid</H2>

        <p class="text">
            The graphics in the leads and TMP view can be shown with, by selecting this option, or
            without, by deselect the option, a grid.<br />
            The grid is only being shown if the size of the view is not too small. If the leads and
            TMP view are sized too small the grid is automatically disabled to reappear again when the
            view is made bigger again.
        </P>


        <A id=isofunction name=isofunction></A>
        <H2>Thorax &#47; heart settings</H2>

        <p class="text">
            <table border="0" cellpadding="6">
                <tr valign="top">
                    <td>
                        1)
                    </td>
                    <td>
                        Thorax isofunction lines. If checked, only iso function lines are used to draw the
                        <A href="thorax.php#surface">potential maps</A> and <A href="thorax.php#surface">sensitivity map</A>,
                        otherwise a complete colormap is used (see <A href="thorax.php">thorax pane</A>).<br />
                        When only the iso function lines are being used to draw, the lungs and the heart are still
                        visible in the semi transparent thorax geometry.
                    </td>
                </tr>
                <tr valign="top">
                    <td>
                        2)
                    </td>
                    <td>Arc ball rotation.
                        <B><I>We are still working on this feature. It will become available as soon as possible!</I><BR/></B>
                    </td>
                </tr>
            </table>
        </P>


        <A id=handlers name=handlers></A>
        <H2>TMP handlers</H2>

        <p class="text">
            For the TMP view two specific options are available:

            <table border="0" cellpadding="6">
                <tr valign="top">
                    <td>
                        1)
                    </td>
                    <td>
                        Combine the resting potential and amplitude handler, i.e. lifting the
                        resting potenial will reduce the upstroke amplitude. If not checked both the
                        amplitude handler and the resting potential handler are visible.
                    </td>
                </tr>
                <tr valign="top">
                    <td>
                        2)
                    </td>
                    <td>
                        When shifting the depolarization time the repolarization time shifts with
                        it or not (keep constant APD)
                    </td>
                </tr>
            </table>
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

