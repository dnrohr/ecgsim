<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
    <head>
        <title>ECGSIM Manual: Focus</title>        <!--META TAGS-->
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

<a href='index.php'>Introduction</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='basic.php'>Basic&nbsp;Usage</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='heart.php'>Heart</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='thorax.php'>Thorax</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='membrane.php'>TMP</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='leads.php'>Leads</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='toolbox.php'>Tools</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''>Focus<img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='options.php'>Preferences</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php'>Case&nbsp;Files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='changes.php'>Versions</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php#download'>Download&nbsp;case&nbsp;files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='update.php'>Update&nbsp;ECGSIM</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='ref.php'>Publications</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='license.php'>License&nbsp;terms</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''></div>                <!--END MANUALSIDEBAR-->
                
                <!--START TEXT-->
                
<!--START LAYOUT DIV-->
<div class="layout">
        <A id="focus" name="focus"></A>
        <H1>Focus: construction of the depolarization sequence</H1>

        <p class="text">
            The <em>foci edit</em> view can be opened under the main menu item <EM>-Heart-</EM> by selecting
            <em>-foci edit-</em> in the <em>-left mouse-</em> sub menu or by selecting
            <a href="heart.php#focus">foci edit</a> in the heart view.
            <br />
            This view is a dockable
            view, which means that is can be dragged outsize the application window but can
            also be embeded in its window left from the heart pane or right from the thorax pane.
            <br />
            When leaving the <em>foci edit</em> mode by selecting an other option in the
            <a href="heart.php#select">heart view</a>, the foci edit view is closed.
        </P>

        <p class="text">
            When in the <TT>foci edit</TT> mode, a node selected on the heart surface can be assigned to
            represent an early break through of depolarization, or an ectopic focus in the event of a single
            activation site. The user may also specify whether the node on the oposite wall is used as a focus.
            This function was added to simulate activations starting within the wall and activating both
            sides of the wall simultaneously. It permits to control the relevant parameters: the initial
            depolarization time of the focus, and the propagation velocity of the depolarization wave front
            started from this focus.
        </P>

        <p class="text">
            The propagtion velocity of the constructed depolarization wave can be changed in a
            local region or global. The way the velocity is adapted depends on the oparation mode:
            <ul>
                <li>
                    <em> construction:</em> In the <TT>construction</TT> mode the velocities can
                    be set on the left and right endocardium, epicardium and transmural. The transmural
                    velocity is slower because of the myocardial fiber orientation. Typical values are
                    0.7 ms<sup>-1</sup> over the wall and 0.3 ms<sup>-1</sup> transmural.
                </li>
                <li>
                    <em>manipuilation:</em> In the <TT> manipulation</TT> the velocities, both over
                    the surface as well as transmural, are derived from the initial depolarization sequence.
                    The user is now able to change the local propagation velocity in respect to the initial esitmated, apparent,
                    velocity. Changes are expressed as a percentage of the initial propagation velocity.
                </li>
            </ul>
        </P>

        <p class="text">
            <IMG class="helpimage" title="" alt="" src="graphics/focusdialogConstruction.PNG" />
            <IMG class="helpimage" title="" alt="" src="graphics/focusdialogManipulation.PNG" />
        </P>

        <a id="repo" name="repo"></a>
        <h2>Repolarization</h2>
<p class="text">
        The repolarization times can be recomputed using an heuristic approach (select <em>global repolarization</em>).
        If one or more foci of depolarization are defined on the heart surface, the activation recovery interval (ARI)
        of each node n can be computed as follows:
        <p class="text">
        <TT>ARI(n) = mARI - alpha x dDEP(n),
        </P>
        <p class="text">
        with mARI(n) = mean( ARI ) and dDEP(n) = DEP(n) - mean(DEP)</TT>
        <br />

        where mARI is the mean ARI defined by the user and alpha the (linear) relation between depolarization time and ARI.
</p>

        <p class="text">
            This heuristic assignment of repolarization times is based on the following arguments. The original
            distribution of the action potential duration is partially an expression of the intrinsic characteristics
            of the myocardium. For another part it is the result of the distribution of the activation times, where
            regions that depolarize early tend to repolarize late. Hence the new action potential duration is set
            the original one, plus a term that is negative is the new activation time is later than before, and vise
            versa. The (default) weight factor 0.4 of alpha is based on the statistical relation between depolarization and repolarization
            times described in Genesis of the T-wave as based on an Equivalent Surface Source Model listed in the
            references section. The whole T wave can be shifted in time by changing the mean ARI (Activation Recovery Interval).
        </P>

        <a id="ectopic" name="ectopic"></a>
        <h2>Construction of activation</h2>

        <p class="text">
            The ectopic focus situation is shown below.
        </P>

        <p class="text">
            <IMG class="helpimage" title="" alt="" src="graphics/focus_single.PNG" />
        </P>

        <p class="text">
            An example of an additional early break through on the right ventricular epiocardium is shown below.
        </P>

        <p class="text">
            <IMG class="helpimage" title="" alt="" src="graphics/focus_merged.PNG" />
        </P>

        <p class="text">
            Any node that is selected to be a focus is marked on  the <A href="heart.php#select">Heart surface</A>
            (black dot in the figure above). The foci indicated with white dots are the foci derived from the
            initial depolarziation sequence.
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

