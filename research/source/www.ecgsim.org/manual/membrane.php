<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
    <head>
        <title>ECGSIM Manual: TMP</title>        <!--META TAGS-->
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

<a href='index.php'>Introduction</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='basic.php'>Basic&nbsp;Usage</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='heart.php'>Heart</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='thorax.php'>Thorax</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''>TMP<img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='leads.php'>Leads</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='toolbox.php'>Tools</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='focus.php'>Focus</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='options.php'>Preferences</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php'>Case&nbsp;Files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='changes.php'>Versions</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php#download'>Download&nbsp;case&nbsp;files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='update.php'>Update&nbsp;ECGSIM</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='ref.php'>Publications</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='license.php'>License&nbsp;terms</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''></div>                <!--END MANUALSIDEBAR-->
                
                <!--START TEXT-->
                
<!--START LAYOUT DIV-->
<div class="layout">
        <H1>Transmembrane Potential (TMP)</H1>

        <UL class="helpmenu">
            <LI><A href="#reset_beat">Reset beat</A></LI>
            <LI><A href="#shape">Changing TMP waveform</A></LI>
            <LI><A href="#elgram">Show electrogram</A></LI>
        </UL>

        <p class="text">
            The TMP view displays the transmembrane potential at the selected node on the heart surface
            (see <A href="heart.php#surface">heart view</A>). The trace in
            <b style="color:#ffffff; background-color:#848397;">WHITE</b> relates to the initial
            parameter values, the one in <b style="color:#cc0000;">RED</b> relates to the user adapted
            parameters.
            <br/>
            The shape of the TMP can be changed by dragging the parameter handlers in the directions pointed
            to by the white triangular arrows.
        </p>

        <p class="text">
            For changing the grid type see <A href="options.php">options/preferences</A>.
        </P>

            <IMG class="helpimage" title="" alt="" src="graphics/TMPview.PNG" />
        
        <p class="text">
            The time bar (<b style="color:#ffdd00; background-color:#848397;">YELLOW</b>) indicates a selected time instant,
            corresponding with the one shown in the <A href="leads.php#timebar">leads</A> view.
            It can be moved by a single left mouse click or dragging.
        </P>

        <p class="text">
            The image shown in the TMP view may be copied to the
            <A href="clipboard.php">clipboard</A> by selecting <TT>Copy</TT> from the
            <TT>TMP</TT> menu, or by pressing <TT>&lt;Ctrl&gt;-C</TT> while the mouse is within
            the TMP view.
        </P>


        <a id="reset_beat" name="reset_beat"></a>
        <h2>Reset beat</h2>

        <p class="text">
            By selecting <TT>-Reset beat-</TT> from the <TT>-Edit-</TT> main menu, or clicking on
            the <IMG class="helpiconbutton" title="" alt="" src="graphics/resetBeat.png" width=24 height=24 />
            toolbar button, all parameter changes untill that moment for the
            <A href="leads.php#beatselection">selected beat</A> and
            <A href="heart.php#surface">shown (active) ventricle or atria</A> will be undone to their
            intial state.
        </P>


        <a id="shape" name="shape"></a>
        <h2>Changing TMP waveform</h2>

        <p class="text">
            Currently, ECGSIM supports 6 parameters to describe the TMP waveform at the selected node. These
            6 parameters are divided into two functional groups that can accessed via the
            <tt>-modify timing/amplitude or waveform-</tt> item in the <tt>-Heart-</tt> main menu item.
        </p>

        <p class="text">
            <blockquote>
                <table border="0" cellpadding="4">
                    <tbody valign="top">
                        <tr>
                            <td>
                                <img class="helpiconbutton" alt="" title="" src="graphics/time_shift.png" width=24 height=24 />
                            </td>
                            <td>
                                <b>the timing and amplitude parameters</b>
                            </td>
                        </tr>
                        <tr>
                            <td align="right">1.</td>
                            <td>depolarization time, the timing of the fastest upstroke of the TMP.</td>
                        </tr>
                        <tr>
                            <td align="right">2.</td>
                            <td>repolarization time, defined as the moment of maximum down-slope during repolarization.</td>
                        </tr>
                        <tr>
                            <td align="right">3.</td>
                            <td>resting potential, the minimum TMP, representing the value of the cardiac myocyte at rest.</td>
                        </tr>
                        <tr>
                            <td align="right">4.</td>
                            <td>
                                amplitude, the maximum upstroke amplitude (not visible when the resting potential and
                                amplitude handlers are <A href="options.php#handlers">combined</A>).
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <img class="helpiconbutton" alt="" title="" src="graphics/slope.png" width=24 height=24 />
                            </td>
                            <td>
                                <b>the slope parameters (TMP waveform)</b>
                            </td>
                        </tr>
                        <tr>
                            <td align="right">5.</td>
                            <td>
                                the plateau slope; this is combined with the repolarization slope. It is constrained to
                                be less than or equal to the repolarization slope (approximately phase 2).
                            </td>
                        </tr>
                        <tr>
                            <td align="right">6.</td>
                            <td>
                                the repolarization slope, which is combined with the plateau slope. It is constrained to
                                be more than or equal to the plateau slope (approximately phase 3).
                            </td>
                        </tr>
                    </tbody>
                </table>
            </blockquote>
        </p>

        <p class="text">
            For each parameter an initial value exists (indicated in <b style="color:#ffffff; background-color:#848397;">WHITE</b>),
            and an user adapted value (indicated in
            <b style="color:#cc0000">RED</b>. The used colors are also used in the
            <A href="leads.php">leads view </A>.

            <p class="text">
                <TT>Double clicking</TT> on a handler resets the selected parameter to its initial value.
            </P>
        </P>


        <A id="elgram" name="elgram"></A>
        <H2>Show/hide electrogram</H2>

        <p class="text">
            You may use this option, <tt>-Show EGM-</tt> in the <tt>-ECGs-</tt> main menu or the corresponding
            toolbutton under the <A href="leads.php#signals">signals</A> button to show or hide the
            electrogram of the node selected on the heart surface.
        </p>

                   <IMG class="helpimage" title="" alt="" src="graphics/TMPviewEMG.PNG" />
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

