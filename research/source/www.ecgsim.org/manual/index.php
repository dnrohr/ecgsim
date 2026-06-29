<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
    <head>
        <title>ECGSIM Manual: Introduction</title>        <!--META TAGS-->
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

Introduction<img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='basic.php'>Basic&nbsp;Usage</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='heart.php'>Heart</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='thorax.php'>Thorax</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='membrane.php'>TMP</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='leads.php'>Leads</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='toolbox.php'>Tools</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='focus.php'>Focus</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='options.php'>Preferences</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php'>Case&nbsp;Files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='changes.php'>Versions</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php#download'>Download&nbsp;case&nbsp;files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='update.php'>Update&nbsp;ECGSIM</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='ref.php'>Publications</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='license.php'>License&nbsp;terms</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''></div>                <!--END MANUALSIDEBAR-->
                
                <!--START TEXT-->
                
<!--START LAYOUT DIV-->
<div class="layout">
        <h1>Introduction</h1>

        <p class="text">
            ECGSIM is an interactive simulation program that enables the user to study the relationship
            between the electric current sources of the heart and the resulting electrocardiographic (ECG)
            signals on the body as well as those on the surface of the heart.
        </p>

        <p class="text">
            It aims to serve as a research tool, as well as an  educational tool.
        </p>

                               <img class="helpimage" alt="" title="Main window of ECGSIM" src="graphics/ECGsimmain.PNG" />
        
        <p class="text">
            ECGSIM simulates ECG signals by specifying the distribution of the electric source strength
            over the surface <i><em>S</em><sub>h</sub></i> bounding the myocardium of either the atria
            or ventricles, viz. the endocardium, epicardium and their connection at the base of the heart.
            The instantaneous source strength is taken to be proportional to the (non-uniform)
            instantaneous local transmembrane potential (TMP). The latter is specified at <i>n</i> nodes, where
            <i>n = [1...N]</i> vertices of a triangular mesh representing <i><em>S</em><sub>h</sub></i>.
        </p>

        <p class="text">
            At each node, the local TMP is specified by a number of parameters, the major ones being 
            the timing of depolarization, <i>dep(n)</i>, and repolarization, <i>rep(n)</i>, and a 
            parameter <i>str(n)</i> that sets the magnitude of the upstroke of the local transmembrane 
            potential. In addition, parameters are incorporated that set the shape (wave form) of the TMP.
        </p>

        <p class="text">
            A set of pre-computed parameter values (e.g. <i>dep(n)</i>,  <i>rep(n)</i>) are provided. 
            These were obtained through an inverse procedure (see <a href="ref.php">references</a>). 
            The quality of the simulations based on these parameters can be observed by comparing the 
            white (simulated) ECGs and the blue (measured) ECGs in the lower right panel of the figure above.
        </p>

        <p class="text">
            The program allows the interactive changing of all local parameter settings to study the effect
            of such changes in the ECG. In the figure above an example is shown (red traces) in which the 
            magnitude of the upstroke of the local transmembrane potential in a local region was reduced, 
            thus simulating the manifestation in the ECG of local ischemia.
            <BR/>
            See <a href="membrane.php">TMP</a> for a more comprehensive description of all TMP parameters.
        </p>

        <p class="text">
            As stated, the cardiac equivalent source involved is the distribution on the heart surface of 
            the local transmembrane potential. The transfer used to determine the expression of these
            sources as body surface potentials was computed by applying the laws of current flow to an 
            inhomogeneous torso model, the geometry of which was based on MRI data.
        </p>

        <p class="text">
            In the previous versions of ECGSIM (before version 2.0) the simulations were confined to the
            electric activity of the ventricles. In the current version the atrial activity has been
            included, thus enabling the simulation of P wave morphology. In addition, the spatial 
            definition of the surface <i><em>S</em><sub>h</sub></i> has been improved by increasing the 
            number of nodes from N=257 to N=1500 evenly distributed nodes and the realism of the mesh
            in the region of the right ventricular outflow tract (ROVT) has been been improved. Moreover, 
            some additional shape parameters for the specification of the TMP waveform have been included.
        </p>

        <p class="text">
            Updates will be available from <a href= "http://www.ecgsim.org">www.ecgsim.org</a>. You may
            determine which version you are currently working with by selecting the <tt>-About-</tt>
            submenu item in the <tt>-Help-</tt> main menu item. <a href="update.php">Checking for updates</a>
            can be done by selecting the <tt>-Check for updates-</tt> menu item that can also be found
            in the same main menu item.
        </p>

        <a id="history" name="history"></a>
        <h2>History</h2>

        <p class="text">
            The theory used has been developed starting in 1972 in a collaboration between the
            department of Medical Physics and the department of Cardiology and Clinical Physiology
            of the University of Amsterdam, and has been expanded from 1981 onward at the
            <a href= "http://www.ru.nl/mbphysics">Department of Medical Physics of the University of Nijmegen</a>,
            both cities located in the Netherlands.<br />
            ECGSIM was introduced to the scientific community through the paper in HEART included in the reference
            list: <a href="ref.php#heartjournal">ECGSIM; an interactive tool for studying the genesis of QRST waveforms</a>.
            The theory behind ECGSIM is explained in the papers shown in the <a href="ref.php">reference</a>
            list. The appropriate references to the early use of ECGSIM would be the paper published in HEART.<br />
            The current simulation package has several predecessors. The ongoing development has been inspired by the
            enthusiastic reactions of the numerous users all over the world.
        </p>

        <p class="text">
            <i>
                <b>Please note:</b> ECGSIM is not a diagnostic tool. Any diagnostic application is only indirect; 
                ECGSIM provides a forward simulation and does not solve the inverse problem.
            </i>
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
