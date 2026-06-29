<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
    <head>
        <title>ECGSIM Manual: Heart</title>        <!--META TAGS-->
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

<a href='index.php'>Introduction</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='basic.php'>Basic&nbsp;Usage</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''>Heart<img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='thorax.php'>Thorax</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='membrane.php'>TMP</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='leads.php'>Leads</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='toolbox.php'>Tools</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='focus.php'>Focus</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='options.php'>Preferences</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php'>Case&nbsp;Files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='changes.php'>Versions</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php#download'>Download&nbsp;case&nbsp;files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='update.php'>Update&nbsp;ECGSIM</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='ref.php'>Publications</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='license.php'>License&nbsp;terms</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''></div>                <!--END MANUALSIDEBAR-->
                
                <!--START TEXT-->
                
<!--START LAYOUT DIV-->
<div class="layout">
        <h1>Heart</h1>

        <ul class="helpmenu">
            <li><a href="#mouse_actions">Mouse actions</a></li>
            <ul type=disc>
                <li><a href="#rotate">Rotate / cross plane</a></li>
                <li><a href="#select">Select</a></li>
                <li><a href="#radius">Radius</a></li>
                <li><a href="#probe">Probe</a></li>
                <li><a href="#focus">foci edit</a></li>
            </ul>
            <li><a href="#surface">Surface functions</a></li>
            <li><a href="#range">Transmural / endocardial or epicardial surface</a></li>
            <LI><A href="#adaptation">Cummulation mode</A></LI>
            <li><a href="#vector">Show/hide heart vector</a></li>
            <li><a href="#scale">Color scale</a></li>
            <li><a href="#electrodes">Show electrodes</a></li>
        </ul>

        <p class="text">
            The heart view is used to display the geometry of the heart (either atria or
            ventricles) as well as a wide range of functions on its <a href="#surface">surface</a>.
            To facilitate the correct interpretation of the ventricles' orientation, the left 
            artery descending (LAD), right coronary artery (RCA) and the left circumflex
            (LCx) may be brought into view. The displayed surface function may be changed by
            various editing tools (see <a href="#mouse_actions">mouse actions</a>).<br />
            Examples of such actions are changing the parameters of the local transmembrane potential
            (<a href="membrane.php">TMP</a>) in the area around the selected node indicated by the
            white circles in the figure below, or defining the status of the node to be that of a 
            focus from which an activation starts.

            <a id="crossplane" name="crossplane"></a>
            <br />
            <img class="helpimage" title="" alt="" src="graphics/heart_surfacefunc.PNG" />
            <br />

            The image shown in the heart view may be copied to the
            <a href="clipboard.php">clipboard</a> by selecting <tt>-Copy-</tt> from the
            main menu item <tt>-Edit-</tt> and then choose <tt>-Heart-</tt>, or by pressing
            <em>&lt;Ctrl&gt;</em><tt>-C</tt>; while the mouse is within the heart view.
        </p>

        <p class="text">
            You may use the <a href="thorax.php#movie">movie</a> option to view the
            development in time of the activation of the heart as a movie.
        </p>

        <p class="text">
            For choosing a preferred color scale see <a href="options.php">preferences</a>.
        </p>


        <a id="mouse_actions" name="mouse_actions"></a>
        <h2>Mouse actions</h2>

        <a id="rotate" name="rotate"></a>
        <h3>Rotate / Cross plane</h3>

        <p class="text">
            The orientation of the heart will be changed when pressing the right mouse button and
            moving the mouse. You may easily return to the standard AP view by double clicking the
            left or right mouse button.
        </p>

        <p class="text">
            The heart will be made <a href="#crossplane">"transparent"</a> by pressing the
            <em>&lt;Shift&gt;</em> key and moving the scroll wheel back and forth, thus generating
            a planar cut through the myocardium and removing the part facing the viewpoint (right 
            panel in the figure above).
            <br />
            The cross plane may also be moved by the <em>arrow up</em> and <em>arrow down</em> keys
            in combination with the <em>&lt;Shift&gt;</em> key. The arrow keys only work after the
            heart view has obtained the <em>"focus"</em> by a mouse click in the heart view.
            <br />
            The plane of intersection is initially set parallel to the plane of the screen. This will 
            change when the heart is rotated, followed by a <em>&lt;Shift&gt; double mouse click</em> left
            or right.
        </p>


        <a id="select" name="select"></a>
        <h3>Select <IMG class="helpiconbutton" title="" alt="" src="graphics/centerrange.png" width=24 height=24 /></h3>

        <p class="text">
            A node at the heart surface is selected by a left mouse button click, i.e. the node nearest
            to the "clicked position" is selected, as shown by a grey spot on the surface (left panel
            of the figure above). In <a href="#adaptation">default mode</a>, single adaptation, only
            one node can be selected at a time; if you select another node, the previous one will be
            deselected.
        </p>

        <p class="text">
            There are different manners in which the area around the node selected may be combined with 
            previously selected locations (see <a href="membrane.php#adaptation"> adding changes</a>).
        </p>

        <p class="text">
            In the <a href="membrane.php">TMP view</a> the transmembrane potential of the selected node
            is displayed.
            The range of the zone in which adaptations will be performed is indicated by nested contours
            at 10 mm inter-distances (see <A href="#radius">radius</A>).
        </p>

        
        <a id="radius" name="radius"></a>
        <h3>Radius <img class="helpiconbutton" alt="" title="" src="graphics/rangeZone.png" width=24 height=24 /></h3>

        <p class="text">
            The radius of the zone of a selected node can be moved towards the center and away from it.
            The radius can be changed by:

            <ul>
                <li>changing the left mouse button function to radius and then drag the mouse while
                pressing the left mouse button,</li>
                <li>by using the <em>scroll wheel</em> or</li>
                <li>by using the <em>arrow up</em> and <em>arrow down</em> keys. To obtain the
                    keyboard input the heart view needs to have the focus, obtained by a mouse
                    click in the heart view.</li>
            </ul>
        </p>

        <p class="text">
            Every <em>wheel click</em> or <em>arrow key press</em> changes the radius by 2 mm. The
            selected zone is indicated by a contour at the selected radius around the center. Additionally
            every 10 mm an extra contour around the center is drawn.
        </p>

        <p class="text">
            The transition from adapted to non-adapted values outside the selected zone is performed
            by the transition zone function, see <a href="toolbox.php#transition">transition zone</a>.
        </p>


        <a id="probe" name="probe"></a>
        <h3>Probe <IMG class="helpiconbutton" title="" alt="" src="graphics/probe.png" width=24 height=24 /></h3>

        <p class="text">
            The probe is used to show the transmembrane potential at the selected position in the <a
            href="membrane.php">TMP view</a> or, if selected, the sensitivity map of the selected node
            displayed in the <a href="thorax.php#surface">thorax pane</a>.
        </p>


        <a id="focus" name="focus"></a>
        <h3>Foci edit <IMG class="helpiconbutton" title="" alt="" src="graphics/focus.png" width=24 height=24 /></h3>

        <p class="text">
            When in <em>foci edit</em> mode the <a href="focus.php">foci edit</a> view will popup. In this
            mode a node selected on the heart surface can be asigned to represent an early break through of
            depolarization, or an ectopic focus in the event of a single activation site.
        </p>


        <A id="surface" name="surface"></A>
        <h2>Surface functions</h2>

        <h3>
            Atria <IMG class="helpiconbutton" title="" alt="" src="graphics/atria.png" width=20 height= 20 /> or
            ventricles <IMG class="helpiconbutton" title="" alt="" src="graphics/ventricle.png" width=20 height= 20 />
        </h3>

        <p class="text">
            For some case files both the atria and ventricles are available. The source (atria/ventricles)
            will be changed by a click on the corresponding (menu) button. This button will only be shown when the
            case file contains both atrial and ventricular data.<br />
            Switching from atria to ventricles or back will also change the <A href="membrane.php">TMP view</A>.
        </p>

                    <IMG title="" class="helpimage" alt=""  src="graphics/heart_atria.PNG" />
            <IMG title="" class="helpimage" alt="" src="graphics/heart_ventricles.png" />
        

        <A id="initialoradapted" name="initialoradapted"></A>
        <h3>
            Initial <IMG class="helpiconbutton" title="" alt="" src="graphics/initialheartvaluesHeart.png" width=20 height=20 /> or
            adapted <IMG class="helpiconbutton" title="" alt="" src="graphics/useradaptedheartvaluesHeart.png" width=20 height=20 /> values
        </h3>

        <p class="text">
            For both atria and ventricles the initial or the adapted parameter values can be shown. To
            display the initial parameter values press the menu button on the right. In
            case the initial values are shown no left mouse button action will be available for the heart view.
        </p>


        <A id="surface_function" name="surface_function"></A>
        <h3>Functions</h3>

        <p class="text">
            On the surface of the heart model several functions can be used to show information.
</p>

            <blockquote>
                <table>
                    <TBODY valign="top">
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/depolarization.png" width=24 height=24 /></TD>
                            <TD>
                                Is used to show the <tt>depolarization</tt> times on the heart and can be used to
                                visualize changes to the depolarization in the <a href="membrane.php#shape">TMP</a>
                                view.
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/repolarization.png" width=24 height=24 /></TD>
                            <TD>
                                Is used to show the <tt>repolarization</tt> times on the heart and can be
                                used to visualize changes to the repolarization in the
                                <a href="membrane.php#shape">TMP</a> view.
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/duration.png" width=24 height=24 /></TD>
                            <TD>
                                Is used to show the activation recovery interval (<tt>ARI</tt>). (This option
                                gives no extra information in the <a href="thorax.php#movie">movie</a> mode.)
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/amplitude.png" width=24 height=24 /></TD>
                            <TD>
                                Is used to show the TMP <tt>amplitude</tt> on the heart and can be
                                used to visualize changes to the amplitude of the waveform shown in the
                                <a href="membrane.php#shape">TMP</a> view. (This option gives no extra
                                information in the <a href="thorax.php#movie">movie</a> mode.)
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/restpot.png" width=24 height=24 /></TD>
                            <TD>
                                Is used to show the TMP <tt>resting potential</tt> on the heart and can be
                                used to visualize changes to the resting potential of the waveform shown in the
                                <a href="membrane.php#shape">TMP</a> view. (This option gives no extra
                                information in the <a href="thorax.php#movie">movie</a> mode.)
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/TMP.png" width=24 height=24 /></TD>
                            <TD>
                                Is used to show the <tt>TMP</TT> at a selected time (see
                                <A href="leads.php#beatselection">leads</A>) on the heart.
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/geometry.png" width=24 height=24 /></TD>
                            <TD>
                                Is used to just show the <TT>geometry</TT> of the heart with all its nodes. It
                                can be used to see where the nodes that can be selected are positioned. (This
                                option gives no extra information in the <a href="thorax.php#movie">movie</a> mode.)
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/contribution.png" width=24 height=24 /></TD>
                            <TD>
                                Is used to show the <A href="transfer.php"><tt>heart contribution</tt></A> to
                                a selected point on the <a href="thorax.php#actions">thorax</a>. <I>The heart
                                contribution can only be shown when a node is selected on the thorax. In case no
                                thorax node is selected no surface function is displayed on the heart. A
                                notification is also given in the statusbar.</I> (This option gives no extra
                                information in the <a href="thorax.php#movie">movie</a> mode.)
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/adaptSurface.png" width=24 height=24 /></TD>
                            <TD>Is used to show the <tt>potential field</tt> strength on the heart.</TD>
                        </TR>
                    </TBODY>
                </table>
            </blockquote>
        

        <a id="range" name="range"></a>
        <h2>Transmural / endocardial or epicardial surface </h2>

        <p class="text">
            With these options you can change the way a selected node on the heart is handled.
        </p>
            <blockquote>
                <table>
                    <TBODY valign="top">
                        <TR>
                            <TD width="70px">
                                <IMG class="helpiconbutton" title="" alt="" src="graphics/switchWallSide.png" width=24 height=24 />
                            </TD>
                            <TD>
                                With this option the current selected node is changed from being selected
                                endocardial to the corresponding epicardial node and vice versa.
                            </TD>
                        </TR>
                        <TR>
                            <TD>
                                <IMG class="helpiconbutton" title="" alt="" src="graphics/transmural.png" width=24 height=24 />
                                <br />
                                <IMG class="helpiconbutton" title="" alt="" src="graphics/singleWallSide.png" width=24 height=24 />
                            </TD>
                            <TD>With this option the current selected node can be switched to being treated as being transmural or not.</TD>
                        </TR>
                    </TBODY>
                </table>
            </blockquote>



        <a id="adaptation"name="adaptation"></a>
        <h2>Cummulation mode</h2>

        <p class="text">
            With these options you can change the behaviour of what happens when
            <A href="heart.php#select">selecting nodes on the heart</A> and changing
            their waveforms.<br />
            This function has three options:
        </p>

           
                <IMG class="helpimage" title="" alt="" src="graphics/cummulation_mode.png" />
            

            <TABLE>
                <TBODY valign="top">
                    <TR>
                        <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/singleselect.png" width=20 height=20 /></TD>
                        <TD>
                            Select a area and use the previously adapted settings to this new selected area.
                            In the previously selected area the adapted parameters are reset to their initial value.
                        </TD>
                    </TR>
                    <TR>
                        <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/AddSingleselect.png" width=20 height=20 /></TD>
                        <TD>
                            Expand the area with the new selected node and use the previously adapted setting to
                            this new selected area. New changes to the settings will be applied to the whole area.
                        </TD>
                    </TR>
                    <TR>
                        <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/addselect.png" width=20 height=20 /></TD>
                        <TD>
                            Adapt the parameters per selected region. None of the parameters are reset.
                        </TD>
                    </TR>
                </TBODY>
            </TABLE>
        </p>


        <A id="vector" name="vector"></A>
        <H2>Show/hide heart vector</H2>

        <p class="text">
            With this menu option the path of the heart vector can be shown or hidden. If shown, the path
            will be drawn through the heart. The resulting vector belonging to the current selected
            time (see <A href="leads.php#beatselection">leads</A>) is shown as an arrow. In
            <a href="thorax.php#movie">movie</a> mode the arrow traverses over the path.<br />
            When this option is being selected, the thorax vector will also be shown in the
            <a href="thorax.php">thorax pane</a>. In this mode no other view surface functions will be
            available in this <a href="#surface">heart pane</a> and <a href="thorax.php#surface">thorax pane</a>
            untill this option is disabled.
        </p>

        <p class="text">
            <img class="helpimage" title="" alt="" src="graphics/heart_vector.png" />
        </p>


        <A id="scale" name="scale"></A>
        <H2>Color scale</H2>

        <p class="text">
            The scale of time and amplitude functions adapt automatically to changes in
            the function values. Adjustment by the user is not possible.
        </p>


        <A id="electrodes" name="electrodes"></A>
        <H2>Show/hide electrodes</H2>

        <p class="text">
            The electrode positions of the selected lead system (see
            <A href="leads.php">leads</A>) can be made visible as grey patches. This is done
            by selecting <tt>-show electrodes-</tt> in the <tt>-options-</tt> main menu item, or toggle the
            corresponding button in the toolbar. This option will enable the visibility of the
            electrode positions in both this pane and the <a href="thorax.php#electrodes">thorax pane</a>.
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

