<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
    <head>
        <title>ECGSIM Manual: Changes</title>        <!--META TAGS-->
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

<a href='index.php'>Introduction</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='basic.php'>Basic&nbsp;Usage</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='heart.php'>Heart</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='thorax.php'>Thorax</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='membrane.php'>TMP</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='leads.php'>Leads</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='toolbox.php'>Tools</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='focus.php'>Focus</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='options.php'>Preferences</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php'>Case&nbsp;Files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''>Versions<img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php#download'>Download&nbsp;case&nbsp;files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='update.php'>Update&nbsp;ECGSIM</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='ref.php'>Publications</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='license.php'>License&nbsp;terms</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''></div>                <!--END MANUALSIDEBAR-->
                
                <!--START TEXT-->
                
<!--START LAYOUT DIV-->
<div class="layout">
        <H1>Versions</H1>

        <p class="text">
            Every new release of ECGSIM includes bug fixes, minor changes
            and improvements. This list gives an overview of the major changes since
            previous releases.
        </P>


        <H2>Release 3.0.0</H2>
        <UL>
            <LI>Improved activation computation.</LI>
            <LI>Home directory on Windows (My documents) is now adressed correctly.</LI>
            <LI>Copy screen panes now has white background color.</LI>
            <LI>Rotated thorax that is linked to the heart rotation is now corretly reset on double click.</LI>
            <LI>New ability to add and adjust multiple ventricular and/or atrial beats.</LI>
            <LI>Major changes in drawing of all graphs resulting in better drawing and speed.</LI>
            <LI>Improved drawing and repfreshing of heart and thorax objects.</LI>
            <LI>Improved refreshing the screen after changes.</LI>
            <LI>Help is now incorporated in the application and is showing in a popup window.</LI>
            <LI>Redesign of the user interface by simplifying the toolbars to one and rearrange the menu accordinly.</LI>
            <LI>ECGsim now compiles on Linux systems, thanks to Michael Clerx (these versions are not distributed).</LI>
            <LI>
                Changed the background color to the color used in the CircAdapt application to emphasize
                the relation between these applications.
            </LI>
            <LI>
                Undo all in replaced with the undo current beat function. This resets the current selected
                beat to its initial state. Undo all can be performed by loading the file again.
            </LI>
            <LI>The export function now stores the files in a logical directory structure</LI>
            <LI>Movie mode is made simpler; just a start and stop button.</LI>
            <LI>
                Initial foci points are now shown as common foci when in foci mode. With this, disabling
                them is the same as other, added foci.
            </LI>
            <LI>Added coronary artery to the normal male case.</LI>
            <LI>More case files can be downloaded and installed during the installation procedure.</LI>
        </UL>


        <H2>Release 2.2.1</H2>
        <UL>
            <LI>Global changs the are now applied correctly when a center is selected.</LI>
            <LI>After a reset the selected center, scale and probe postion are maintained.</LI>
            <LI>The lungs are now disabled when no lungs are visible (BSM on thorax).</LI>
            <LI>The vector will now be shown with a transparent heart.</LI>
            <LI>The ARI computation in focus mode are now correctly updated.</LI>
            <LI>Positioning of lead V3 corrected in the normal_young_male cases.</LI>
            <LI>Repolarization change parameters added to compute the repolarization times from the simulate depolarization times.</LI>
            <LI>Changed the default surface velocity.</LI>
            <LI>ECG's are now updated after loading the ECG.</LI>
        </UL>


        <H2>Release 2.2.0</H2>
        <UL>
            <LI>Improved activation construction functionality added.</LI>
            <LI>The cross plane is now rotated when the shift button is pressed.</LI>
            <LI>Added RMS curve to the ECG signals.</LI>
            <LI>Added the ability to show/hide the electrodes and lungs in the thorax pane.</LI>
            <LI>Added the ability to rotate the heart and thorax simultaneously.</LI>
            <LI>Checking for updates functinality added to ECGsim.</LI>
            <LI>Changed license to GNU GPL.</LI>
            <LI>Heart appears transparent is fixed.</LI>
            <LI>Graph matrices are now added to export function.</LI>
            <LI>Reset AV delay is now handled correctly.</LI>
            <LI>Default behavior changed. The APD is kept constant when shifting the depolarization times.</LI>
        </UL>


        <H2>Release 2.1.1</H2>
        <UL>
            <LI>Import and export of the parameter settings.</LI>
            <LI>The selection of multiple regions is improved.</LI>
            <LI>Improved the single lead and the contribution maps.</LI>
            <LI>Show/hide lungs in the thorax pane.</LI>
            <LI>Help files have been updated.</LI>
            <LI>A few bug fixes.</LI>
        </UL>


        <H2>Release 2.1</H2>
        <UL>
            <LI>Improvements in user interface (e.g. scroll wheel handling, arrows up /down etc).</LI>
            <LI>Help files have been updated.</LI>
            <LI>Several bug fixes.</LI>
            <LI>TMP matrices are exported as well.</LI>
        </UL>


        <H2>Release 2.0</H2>
        <UL>
            <LI>Complete new redesign of the ECGSIM code.</LI>
            <LI>Able to show the atrial and ventricular signals.</LI>
            <LI>Loading of case files.</LI>
        </UL>


        <H2>Release 1.4</H2>
        <UL>
            <LI>It is now possible to save simulated MCGs.</LI>
            </LI>
        </UL>


        <H2>Release 1.3</H2>
        <UL>
            <LI>Some bugs have been cruched.</LI>
            <LI>Printing has been improved.</LI>
            <LI>The size and position of the ECGSIM window is retained between sessions.</LI>
            <LI>The user can specify alternative heart and torso geometry.</LI>
            <LI>
                In order to make ECGSIM behave more like most users seem to expect 
                changing the range nows lead to the recomputation of the source parameters 
                within the range around the selected node.
            </LI>
        </UL>


        <H2>Release 1.2</H2>
        <UL>
            <LI>Activation patterns can be generated by defining foci at the epicardium.</LI>
            <LI>
                More display options in the thorax pane: heart, lungs, and thorax can be 
                hidden, made transparent or opaque.
            </LI>
            <LI>
                More display options in the heart pane: left arteria decendens (LAD) and range 
                of selection can be visualized.
             
            </LI>
            <LI>Transmembrane potentials and epicardial potentials can be mapped in the heart pane.</LI>
            <LI>Electrograms can be displayed in the membrane pane.</LI>
            <LI>The Vectorcardiogram can be plotted in the ECGs pane.</LI>
            <LI>
                The heart vector and vector loop can be plotted in the heart and thorax 
                panes and <TT>Thorax Options</TT>.
            </LI>
            <LI>The slope of the repolarization phase of the transmembrane potential can be changed.</LI>
            <LI>The MCG can be simulated and displayed.</LI>
            <LI>Different temporal filtering options are available for the simulated ecgs.</LI>
        </UL>


        <H2>Release 1.1</H2>
        <p class="text">
            Release 1.1 was the first full release of ECGSIM. From 1.1
            onward changes between the various releases have been identified in the
            releases.
        </P>

        <H2>Release 1.0</H2>
        <p class="text">
            Release 1.0 existed only as a beta version. Also, several
            subsequent early versions have been published as version 1.0.
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

