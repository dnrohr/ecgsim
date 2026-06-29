<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
    <head>
        <title>ECGSIM Manual: Thorax</title>        <!--META TAGS-->
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

<a href='index.php'>Introduction</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='basic.php'>Basic&nbsp;Usage</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='heart.php'>Heart</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''>Thorax<img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='membrane.php'>TMP</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='leads.php'>Leads</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='toolbox.php'>Tools</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='focus.php'>Focus</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='options.php'>Preferences</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php'>Case&nbsp;Files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='changes.php'>Versions</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php#download'>Download&nbsp;case&nbsp;files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='update.php'>Update&nbsp;ECGSIM</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='ref.php'>Publications</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='license.php'>License&nbsp;terms</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''></div>                <!--END MANUALSIDEBAR-->
                
                <!--START TEXT-->
                
<!--START LAYOUT DIV-->
<div class="layout">
        <H1>Thorax</H1>

        <UL class="helpmenu">
            <LI><A href="#surface">Surface function</A></LI>
            <LI><A href="#lungs">Show/Hide lungs</A></LI>
            <LI><A href="#electrodes">Show/Hide electrodes</A></LI>
            <LI><A href="#link">Lock to heart</A></LI>
            <LI><A href="#scale">Scale</A></LI>
            <LI><A href="#movie">Movie</A></LI>
            <LI><A href="#actions">Mouse actions</A></LI>
            <LI><A href="#options">Display options</A></LI>
        </UL>

        <p class="text">
            The thorax pane is used to display the geometry of the thorax and any of a
            range of functions on its surface. You may rotate the thorax by right mouse 
            dragging, i.e. move the mouse while holding the right mouse button down.
            <BR/>
            You may go back to the standard frontal AP view (natural frontal view) by a 
            <EM> left double mouse</EM> click.
        </p>

        <p class="text">
            If a node on the thorax is selected, it is shown by a black dot on the surface.
        </p>

        
            <IMG class="helpimage" title="thorax paramters" alt="" src="graphics/thorax_view.PNG" />
       

        <p class="text">
            The electrode positions of the selected lead system (see 
            <A href="leads.php">leads</A>) are shown as grey patches. The figure below
            shows the nine electrodes of the standard 12 lead system.
        </P>

                    <IMG class="helpimage" title="potential map" alt="" src="graphics/thorax_potentials.PNG" />
       
        <p class="text">
            The contents of the thorax pane is copied onto the <A href="clipboard.php">clipboard</A>
            by selecting <tt>-Copy-</tt> from the main menu item <tt>-Edit-</tt> and then choose
            <tt>-Thorax-</tt>, or by pressing <em>&lt;Ctrl&gt;</em><tt>-C</tt> while the mouse is
            within the thorax pane.
        </P>

        <p class="text">
            You may use the <A href="#movie">movie</A> option to view the development in time of the
            activation of the heart as ... a movie.
        </P>


        <A id="surface" name="surface"></A>
        <H2>Surface function</H2>

        <p class="text">
            Default the geometries of the heart, lungs and thorax are shown. Additionally the body
            surface potentials (BSPM) at the selected time can be shown or the sensitivity map (see
            <A href="transfer.php">transfer function</A>).<br />
            Body surface potentials can be displayed for the:

            <blockquote>
                <table>
                    <TBODY valign="top">
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/torso.png" width=24 height=24 /></TD>
                            <TD>
                                Is used to show a semi transparent <tt>geometry</tt> of the thorax. Within this
                                thorax the same heart with equal selected
                                <a href="heart.php#surface_function">surface function</a> as shown in the
                                <a href="heart.php">heart view</a> is being shown. Default the lungs are shown
                                as well but this can be <a href="#lungs">disabled</a>.
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/measSurface.png" width=24 height=24 /></TD>
                            <TD>
                                Is used to show the <tt>measured</tt> Body Surface Potentials Map.
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/initSurfaceActive.png" width=24 height=24 /></TD>
                            <TD>
                                Is used to show the simulated Body Surface Potentials Map with <tt>initial</tt>
                                parameter settings.
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/adaptSurface.png" width=24 height=24 /></TD>
                            <TD>
                            Is used to show the simulated Body Surface Potentials Map with
                            <a href="membrane.php#shape"><tt>adapted</tt> parameter</a> settings.
                            </TD>
                        </TR>
                        <TR>
                            <TD><IMG class="helpiconbutton" title="" alt="" src="graphics/contribution.png" width=24 height=24 /></TD>
                            <TD>
                                Is used to show the <A href="transfer.php"><tt>sensitivity map</tt></A> on the
                                thorax for a probed point on the heart. <I>The sensitivity map can only be shown
                                when a <A href="heart.php#probe">probe</A> position is selected on the heart. In
                                case no valid probe postion is determined no surface function is displayed on the
                                thorax. A notification is also given in the statusbar.</I>
                            </TD>
                        </TR>
                    </TBODY>
                </table>
            </blockquote>
        </P>

        <p class="text">

            When viewing a BSPM you may press the left and right arrow keys to step forward/backward in
            time. Alternatively, you may click in the <A href="membrane.php">TMP</A> or in the
            <A href="leads.php">ECGs</A> view to select the time instant for which you wish the
            potentials to be displayed.
        </P>


        <A id=lungs name=lungs></A>
        <H2>Show/Hide lungs</H2>

        <p class="text">
            The lungs can be hidden by selecting this
            <IMG class="helpiconbutton" title="" alt="" src="graphics/thoraxwithlungs.png" en="" width=30 height=30 />
            option in the <tt>-thorax-</tt> main menu item and shown again by unselecting this this same option,
            now showing <IMG class="helpiconbutton" title="" alt="" src="graphics/thoraxnolungs.png" en="" width=30 height=30 />,
            again.
        </p>


        <A id=electrodes name=electrodes></A>
        <H2>Show/Hide electrodes</H2>

        <p class="text">
            The electrodes on the thorax and <a href="heart.php#electrodes">heart</a> can be shown by selecting this
            <IMG class="helpiconbutton" title="" alt="" src="graphics/Hide_Electrodes_lungs.png" en="" width=30 height=30 />
            option on the toolbar or within the <tt>-options-</tt> main menu item and hidden again by unselecting this
            same option, now showing <IMG class="helpiconbutton" title="" alt="" src="graphics/show_Electrodes.png" en="" width=30 height=30 />,
            again.
        </p>


        <A id=link name=link></A>
        <H2>Lock to heart</H2>

        <p class="text">
            The orientation and rotation of the heart and thorax can be linked by selecting this
            <IMG class="helpiconbutton" title="" alt="" src="graphics/heart_rotate.png" en="" width=30 height=30 />
            option in the <tt>-thorax-</tt> main menu item. If this option is enabled rotating the heart will also rotate
            the thorax in the same way and vice versa. Double clicking in the thorax or heart pane will restore the position
            of both the thorax and heart to the initial position.
        </p>


        <A id=scale name=scale></A>
        <H2>Scale</H2>

        <p class="text">
            The amplitude scale may be changed by scrolling with the mouse wheel or by the by the
            <EM>arrow up</EM> and <EM>arrow down</EM> keys.<br />
            The arrow keys only work after the thorax pane has obtained the <EM>"focus"</EM> by
            a mouse click in the thorax pane.
        </p>


        <A id="movie" name="movie"></A>
        <H2>Movie<A href=""><IMG class="helpiconbutton" title=play alt="" src="graphics/media-play-32.png" /></A></H2>

        <p class="text">
            The movie option can be used to view the development of the potentials in time
            as a movie. The movie may be started and stopped by pressing the play/stop button
            in the toolbar.<br />
        </p>
<p class="text">
        The movie loops through the time starting at the beginning of the shown ECG signals up 
        to the end of the shown signals (see <A href="leads.php">leads</A>). When the 
        depolarization times are shown on the heart surface the movie shows the progression of 
        the activation wave over the heart surface, both in the thorax pane and the heart view.
</p>
        
            <IMG class="helpimage" title="heart movie" alt="" src="graphics/heart_movie.PNG" />
            <IMG class="helpimage" title="thorax movie" alt="" src="graphics/thorax_movie.PNG" />
       

        <A id="actions" name="actions"></A>
        <H2>Mouse actions</H2>
        
        <H3>select thorax node</H3>

        <p class="text">
            <B>
                This function is only available when a <EM>single lead</EM> ECG is shown in the
                <A href="leads.php">leads view</A> or when the <A href="heart.php#surface_function">contribution map</A>
                is selected in the heart view.<BR/>
            </B>
            A node at the thorax is selected by clicking with the left mouse button on the thorax
            surface. The node nearest to the "click" is selected, as shown by a black patch on the
            surface. Only one node may be selected at a time.
            <BR/>
            If you select another node, the previous one is deselected.
        </p>


        <A id="options" name="options"></A>
        <H2>Display options</H2>

        <p class="text">
            If you want to map a function on the thorax while also seeing through its
            surface, use <A href="options.php#isofunction">iso function lines</A> only.
        </p>

        <p class="text">
            For selecting any of the available color-codings see
            <A href="options.php#color">preferences</A>.
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

