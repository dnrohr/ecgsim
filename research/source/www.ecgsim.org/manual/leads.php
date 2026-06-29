<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
    <head>
        <title>ECGSIM Manual: Leads</title>        <!--META TAGS-->
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

<a href='index.php'>Introduction</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='basic.php'>Basic&nbsp;Usage</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='heart.php'>Heart</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='thorax.php'>Thorax</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='membrane.php'>TMP</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''>Leads<img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='toolbox.php'>Tools</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='focus.php'>Focus</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='options.php'>Preferences</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php'>Case&nbsp;Files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='changes.php'>Versions</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php#download'>Download&nbsp;case&nbsp;files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='update.php'>Update&nbsp;ECGSIM</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='ref.php'>Publications</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='license.php'>License&nbsp;terms</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''></div>                <!--END MANUALSIDEBAR-->
                
                <!--START TEXT-->
                
<!--START LAYOUT DIV-->
<div class="layout">
        <H1>Leads</H1>

        <UL class="helpmenu">
            <LI><A href="#signals">Signals</A></LI>
            <LI><A href="#filtering">Coupling / filtering</A></LI>
            <LI><A href="#beatselection">Beat selection</A></LI>
            <LI><A href="#vector">Vector cardiogram (VCG)</A></LI>
            <LI><A href="#scale">Scale</A></LI>
            <LI><A href="#copy">Copy</A></LI>
        </UL>

        <p class="text">
            In most cases the leads view allows the display of the ECG signals observed by the following
            lead systems:

            <blockquote>
                <UL>
                    <LI>the standard 12-lead system,</LI>
                    <LI>the <A href="#vector">vector cardiogram</A> according to the Frank lead system,</LI>
                    <LI>a 64-lead BSPM system (WCT reference),</LI>
                    <LI>
                        a minimap montage of the unweighted nine signals (with WCT reference) observed 
                        at the nine electrodes sensing the standard 12-leads and
                    </LI>
                    <LI>
                        a single lead positioned at either of the thorax nodes (WCT reference),
                        see <A href="thorax.php#actions">thorax mouse actions</A>.
                    </LI>
                </UL>
            </blockquote>
        </P>

        <p class="text">
            These lead system are part of the <A href="file.php">case file</A> and thus can vary between
            different files.
        </P>

        <A id="timebar" name="timebar"></A>
        <p class="text">
            The time bar (<b style="color:#ffdd00; background-color:#848397;">YELLOW</b> lines) indicates
            the selected time instance, which may be changed by a single left mouse click or dragging;
            see also the <A href="#beatselection">beat selection</A>.
        </P>

        <p class="text">
            For changing the displayed grid: see <A href="options.php#grid">preferences</A>.
        </P>

        
            <IMG class="helpimage" alt="" title="" src="graphics/ECGS_12_leads.PNG" />
        


        <A id="signals" name="signals"></A>
        <H2>Signals <IMG class="helpiconbutton" title="" alt="" src="graphics/signals.png" width=24 height=24 /></H2>

        <p class="text">
            For each of the lead systems a superposition of up to three of the following ECG signals may be viewed.
            Apart from those three a RMS signal for each of them can be added as shown in the figure below.

            <blockquote>
                <table>
                    <TBODY valign="top">
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/measECG.png" width=24 height=24 /></TD>
                            <TD>
                                the measured ECG signals,
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/initECG.png" width=24 height=24 /></TD>
                            <TD>
                                the simulated ECG signals based on the initial parameter settings,
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/adaptECG.png" width=24 height=24 /></TD>
                            <TD>
                                the simulated ECG signals with adapted parameter settings,
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/elg.png" width=24 height=24 />
                            </TD>
                            <TD>
                                the electrogram for the <A href="heart.php#select">selected point on the heart</A> will be shown.
                                This electrogram will be shown in the <A href="membrane.php#elgram">TMP pane</A>.
                            </TD>
                        </TR>
                        <TR>
                            <TD width="70px">
                                <IMG class="helpiconbutton" title="" alt="" src="graphics/Rms.png" width=24 height=24 />
                            </TD>
                            <TD>
                                the RMS for each of the shown ECG signals.
                            </TD>
                        </TR>
                    </TBODY>
                </table>
            </blockquote>
        </P>

                <IMG class="helpimage" alt="" title="" src="graphics/ECG_RMS.PNG" />
        
        <A id="filtering" name="filtering"></A>
        <H2>Coupling / filtering</H2>

        <p class="text">
            In the coupling menu, you may choose the type of temporal filtering applied to the ECGs.
            <blockquote>
                <table>
                    <TBODY valign="top">
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/baseline.png" width=24 height=24 /></TD>
                            <TD>
                                If you choose <TT>baseline correction</TT> (the default value) the mean value
                                of the potentials is set such that their values at the beginning of the P wave
                                and at the termination of the T wave are zero.
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/DC.png" width=24 height=24 /></TD>
                            <TD>
                                If you choose <TT>AC coupling</TT> the mean of the potential over time will
                                be set to zero for all leads (as results from AC coupling without baseline correction).
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/AC.png" width=24 height=24 /></TD>
                            <TD>
                                If you choose <TT>DC coupling</TT> no filtering of the ECGs is applied (the true DC
                                level is shown).
                            </TD>
                        </TR>
                    </TBODY>
                </table>
            </blockquote>
        </P>


        <A id="beatselection" name="beatselection"></A>
        <H2>Beat / time selection</H2>

        <p class="text">
            If surface potentials are displayed in the
            <A href="heart.php#surface_function">Heart</A> or <A href="thorax.php#surface">thorax</A>
            views, the vertical <b style="color:#ffdd00; background-color:#848397;">YELLOW</b> lines visible
            in the plots indicate the time instant for which the potential maps are displayed.<br />
            The time instant may be set by clicking on the left mouse button within the leads view or by
            dragging the line to the desired position with the mouse while holding down the left mouse
            button. You may also press the left and right arrow keys to in- and decrease the selected time with
            steps of 2 ms.<br />
            When the case file contains more then one beat (atrial and/or ventricle), you can zoom in to one beat
            by double clicking with the left mouse button on a time moment withing the desired beat. The choice
            between the ventricle or atria information shown in the TMP pane is determained by the current shown
            part in the <A href="heart.php#surface">heart pane</A>.<br />
            To restore the signals to show all beats, double click the left mouse button again.
        </P>

        <p class="text">
            When an interval is being selected in this leads view, the same interval will be indicated
            in the <A href="membrane.php">TMP pane</A>. This will be done by making the part(s) that
            do not belong to the selected interval a bit lighter in color.
        </p>


        <a id="vector" name="vector"></a>
        <H2>Vector cardiogram (VCG)</H2>

        <p class="text">
            The VCG is derived from the Frank lead system. Three cross sections of the thorax are shown,
            drawn through the center of gravity of the ventricular myocardium. The loops shown are the
            projections of the 3D vector loop onto each of the planes.
        </P>

        <p class="text">
            <I>
                Note: The horizontal plane is viewed from the feet.
            </I>
        </P>

              <IMG class="helpimage" alt="" title="" src="graphics/VCGS.PNG" />
        

        <A id="scale" name="scale"></A>
        <H2>Scale</H2>

        <p class="text">
            The amplitude scale can be changed by scrolling <TT>the mouse wheel</TT>.
        </P>


        <A id="copy" name="copy"></A>
        <H2>Copying the content of the leads view</H2>

        <p class="text">
            The image shown in the leads view may be copied to the <A href="clipboard.php">clipboard</A>
            by selecting <TT>-Copy-</TT> from main menu item <tt>-Edit-</tt> and then choose <tt>-ECG-</TT>,
            or by pressing <em>&lt;Ctrl&gt;</em><tt>-C</tt> while the mouse is within the leads view.
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

