<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
    <head>
        <title>ECGSIM Manual: Tools</title>        <!--META TAGS-->
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

<a href='index.php'>Introduction</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='basic.php'>Basic&nbsp;Usage</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='heart.php'>Heart</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='thorax.php'>Thorax</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='membrane.php'>TMP</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='leads.php'>Leads</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''>Tools<img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='focus.php'>Focus</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='options.php'>Preferences</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php'>Case&nbsp;Files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='changes.php'>Versions</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php#download'>Download&nbsp;case&nbsp;files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='update.php'>Update&nbsp;ECGSIM</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='ref.php'>Publications</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='license.php'>License&nbsp;terms</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''></div>                <!--END MANUALSIDEBAR-->
                
                <!--START TEXT-->
                
<!--START LAYOUT DIV-->
<div class="layout">
        <h1>Tools</h1>
        <UL class="helpmenu">
            <LI> <A href="#view">View</A>
            <LI> <A href="#avconduction">Create rhythm</A>
            <LI> <A href="#statistics">Statistics</A>
            <LI> <A href="#transition">Transition zone</A>
            </LI>
        </UL>

        <p class="text">
            This view can be opened under the main menu item <EM>-Options-</EM> by selecting
            <em>Tools</em>. This view is a dockable view, which means that is can be dragged
            outsize the application window but can also be embed in its window left from the
            heart pane or right from the thorax pane.
        </P>

        <p class="text">
            This view contains 4 tabs with on each of them grouped functionality.
        </P>

        
        <a name="view" id="view"></a>
        <h2>Views</h2>

        <p class="text">
            In this tab four standard, predefined 'views' on the <a href="heart.php#rotate">heart</a>
            orientation are provided, the <em>anterior posterior view</em>,
            the <em>posterior anterior view</em>, the <em>superior inferior view</em> and the
            <em>inferior superior view</em>.
        </p>

                    <img class="helpimage" alt="" title="" src="graphics/views.PNG" />
        
        <p class="text">
            Next to these four 'views', the user may store the current orientation of the heart in its
            view by pressing the <EM>store</EM> button. The stored orientation can be restored by
            pressing <em> stored view</em>.
        </p>


        <a name="avconduction" id="avconduction"></a>
        <h2>Create rhythm</h2>

        <p class="text">
            Traditionally ECGsim simulates only a single heart beat, i.e. a single atrial and/or ventricular activation.
            This, however, does limit the clinical educational application as a rhythm ECG strip is normally provided. Therefore
            ECGsim also offers the opportunity to add muliple atrial and ventricular activations. This feautuer enables the simulation of
            an atrial tachycardia with irrecgular AV conduction or the changes in the ECG due to an ischemic event over time.
            </p>
            <img class="helpimage" alt="" title="" src="graphics/avconduction_manual.png" />
            <P class="text">
            Each atrial or ventricular activation can be added by the <em> add at</em> button. The maximum ECG strip
            length is 10 seconds, i.e. when the rhythm strip has more then 10 seconds in length no event can be added.
            </p>
            <IMG class="helpimage" alt="" title="" src="graphics/ECGS_12_leads.PNG" />
            
        <a name="statistics" id="statistics"></a>
        <h2>Global TMP parameters</h2>

        <p class="text">
            This tab is divided in three groups.
            <blockquote>
                <UL>
                    <LI>Statistics of the timing TMP parameters</LI>
                    <LI>Adapt the timing of TMP parameters</LI>
                    <LI>Adapt other TMP parameters</LI>
                </UL>
            </blockquote>
        </P>

                    <img  class="helpimage" alt="" title="" src="graphics/statistics.PNG" />
              <p class="text">
            The <em>Statistics of the timing TMP parameters</em> box in the figure shown above
            displays some basic statistics of the timing parameters.
        </p>

        <p class="text">
            The <em>Adapt the timing of TMP parameters</em> box permits the user to specify these
            statistics. This is effected by scaling and/or shifting the involved source
            parameters, while retaining the pattern of their distribution.
            <br />
            The result of these changes are immediately visible in the various views after the changed
            value field has lost focus, i.e. click with the mouse in an other field in the view, or
            when the <em>&lt;ENTER&gt;</em> button is hit. An extra option is to press the
            <em>apply</em> button.
        </p>

        <p class="text">
            The timing values  are supervised automatically to ensure that no non-valid values of the timing
            parameters are generated (such as: depolarization before 0 ms, or an activation recovery interval
            less than 50 ms).<br />
            Note that scaling of the depolarization dispersion will lead to changes in the action potential
            duration dispersion and vice versa (recall: for each node the repolarization time is equal to the
            depolarization time plus the action potential duration: <em>rep = dep + apd</em>).
        </p>

        <p class="text">
            The <em>Adapt other TMP parameters</em> box of the view permits a global adjustment of the
            shape parameters of the TMPs.
        </p>
        

        <a name="transition" id="transition"></a>
        <h2>Transition zone</h2>

        <p class="text">
            When an area is selected in the <a href="heart.php#select">heart</a> view the adaptations are
            tapered off from 100% at the selected node toward zero at the boundary of the selected area
            around it. The manner in which  this is done can be modified by changing the slope shown in
            this tab by dragging the slope handler in the directions pointed to by the white triangular
            arrows - left or right.
        </P>

        <p class="text">
            Note: Changes only apply to the the <strong>currently</strong> selected area and not to the
            previous selected areas when in <em>expand adaptation region mode</em> or in <em>select
            several adapttion regions mode</em> in the <a href="membrane.php#adaptation">TMP</a> view.
        </p>

        
            <img  class="helpimage" alt="" title="" src="graphics/transitionzone.PNG" />
       
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

