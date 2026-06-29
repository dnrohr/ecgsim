<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
    <head>
        <title>ECGSIM Manual: File</title>        <!--META TAGS-->
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

<a href='index.php'>Introduction</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='basic.php'>Basic&nbsp;Usage</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='heart.php'>Heart</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='thorax.php'>Thorax</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='membrane.php'>TMP</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='leads.php'>Leads</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='toolbox.php'>Tools</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='focus.php'>Focus</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='options.php'>Preferences</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''>Case&nbsp;Files<img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='changes.php'>Versions</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php#download'>Download&nbsp;case&nbsp;files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='update.php'>Update&nbsp;ECGSIM</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='ref.php'>Publications</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='license.php'>License&nbsp;terms</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''></div>                <!--END MANUALSIDEBAR-->
                
                <!--START TEXT-->
                
<!--START LAYOUT DIV-->
<div class="layout">
        <H1>Case Files</H1>
        <UL class="helpmenu">
            <LI><A href="#open">Open</A></LI>
            <LI><A href="#opendefault">Open Default</A></LI>
            <LI><A href="#download">Download case file</A></LI>
            <LI><A href="#save">Save</A></LI>
            <LI><A href="#opensource">open/save source info</A></LI>
            <LI><A href="#loadECG">load ECG files</A></LI>
            <LI><A href="#export">Export</A></LI>
        </UL>


        <A id="open" name="open"></A>
        <H2>Open</H2>

        <p class="text">
            The <TT>Open</TT> menu item starts up a file open dialog to open any of the available
            files with extension <TT>ECGsimcase</TT> in the documents folder of the user, e.g. for
            windows the <TT>home</TT> folder or any location the user navigated to.
        </P>


        <A id="opendefault" name="opendefault"></A>
        <H2>Open default</H2>

        <p class="text">
            The <TT>Open</TT> menu item starts up a file open dialog to open any of the available
            <TT>default ECGsimcase</TT> files with extension <TT>ECGsimcase</TT> in the ECGSIM
            application directory. These files are read only and should not be saved at its original
            location.
        </P>


        <A id=download name="download"></A>
        <H2>download case files</H2>

        <p class="text">
            On the <a href= "http://www.ecgsim.org/downloads/cases.php">www.ecgsim.org</a> website
            more case files for ECGSIM can be found and downloaded. To help you open this website
            location in a browser, you can open it from within ECGSIM. This is done by pressing
            the <tt>-download case files-</tt> menu item. For Windows this item is located in the
            <tt>-Help-</tt> main menu item. For OS X it is located in the <tt>-application-</tt>
            menu.
        </P>


        <A id="save" name="save"></A>
        <H2>Save</H2>

        <p class="text">
            The <TT>Save</TT> menu item saves the case file with extension <TT>ECGsimcase</TT>. In
            case some function values have been changed these changes are saved. When the file is
            loaded again these changes are visible again.
            <br />
            It is not possible to save one of the default cases (read only).
            <br />
            Any applied variation in the parameter settings (included in the case file) may be saved
            under a unique file name.
        </P>


        <A id=opensource name="opensource"></A>
        <H2>Open/Save source info</H2>

        <p class="text">
            The <TT>Save Source Info</TT> menu item saves the source data (parameter values) of all
            sources within a case file to a seperated file with extension <TT>ECGsimsource</TT>.
            When the file is loaded again (<TT>Open Source Info</TT>) the stored source parameters
            replace the current ones. If the source file does not match the current case file, no data
            is loaded.
        </P>


        <A id=loadECG name="loadECG"></A>
        <H2>load ECG file</H2>

        <p class="text">
            With the <TT>load ECG file</TT> menu item a <a href="#ecg_file">new ECG file</a> can be
            loaded. This loaded ECG will replace the measured ECG shown in the
            <a href="leads.php#signals">leads</a> view. To reatore the original measured ECG a reload
            of the case file is necessary.
        </P>


        <A id="export" name="export"></A>
        <H2>Export</H2>

        <p class="text">
            This opens a directory dialog, in which all relevant parts of the case file are exported in separate files
            withing a directory structure.
        </P>

        <img class="helpimage" alt="" title="" src="graphics/export_dir.png" />

        <p class="text">
            The following files are saved:
        </P>


        <blockquote>
            <A id="ecg_file" name="ecg_file"></A>
            <H3>ECG files</H3>

            <p class="text">
                The sample frequency is 1000 Hz. Generally the number of measured signals is less than the number of thorax nodes.
                The remaining signals were interpolated. The following files will be stored in the <EM>ecgs</EM> subdirectory:

                <blockquote>
                    <UL>
                        <LI>the measured ECG (<EM>.refECG</EM> <A href="file.php#matrix">Matrix</A>),</LI>
                        <LI>the simulated ECG with the adpated parameter values (<EM>.adaptECG </EM> <A href="file.php#matrix">Matrix</A>),</LI>
                    </UL>
                </blockquote>
            </P>


            <A id="triangulation" name="triangulation"></A>
            <H3>Triangulation files</H3>

            <p class="text">
                The triangulation files (<A href="file.php#geo">Geometry</A>) of:

                <blockquote>
                    <UL>
                        <LI>atria and ventricles,</LI>
                        <LI>thorax,</LI>
                        <LI>left and right lung.</LI>
                        <LI>left and right blood cavaty.</LI>
                    </UL>
                </blockquote>

                will be stored in the <EM>model</EM> subdirectory.
            </P>


            <A id="parameters" name="parameters"></A>
            <H3>Source parameters</H3>

            <p class="text">
                The values of the user adapted source parameters for the atria (if available) and ventricles (if available):

                <blockquote>
                    <UL>
                        <LI>depolarization times in ms <EM>.user.dep</EM> (<A href="file.php#asci">asci</A>),</LI>
                        <LI>repolarization times in ms <EM>.user.rep</EM> (<A href="file.php#asci">asci</A>),</LI>
                        <LI>amplitude in mV <EM>.user.ampl</EM> (<A href="file.php#asci">asci</A>),</LI>
                        <LI>resting potential in mV  <EM>.user.rest</EM> (<A href="file.php#asci">asci</A>),</LI>
                        <LI>
                            Slopes  of depolarization, repolarization and plateau, <EM>.user.depslope, .user.repslope,</EM>
                            and <EM>.user.platslope</EM> (<A href="file.php#asci">asci</A>).
                        </LI>
                    </UL>
                </blockquote>

                will be stored in a, per beat subdirectory (<EM>beat[1-x]</EM>) within the <EM>ventricular_beats</EM> or
                <EM>atrial_beats</EM> subdirectory.
            </P>


            <A id="waveforms" name="waveforms"></A>
            <H3>TMP waveforms</H3>

            <p class="text">
                The TMP waveforms at every node on the atria (if available) and ventricles (if available):

                <blockquote>
                    <UL>
                        <LI>
                            the TMP computed with user adapted parameter settings,
                            <EM>.user.source</EM> (<A href="file.php#matrix">Matrix</A>).
                        </LI>
                    </UL>
                </blockquote>

                will be stored in a, per beat subdirectory (<EM>beat[1-x]</EM>) within the <EM>ventricular_beats</EM> or
                <EM>atrial_beats</EM> subdirectory.
            </P>


            <A id="loactions" name="loactions"></A>
            <H3>Lead loactions</H3>

            <p class="text">
                The electrode locations for all lead systems. For example, for the 12 leads system, the electrode positions are
                stored in the order of VR, VL, VF, V1-V6. The following files will be stored in the <EM>ecgs</EM> subdirectory:

                <blockquote>
                    <UL>
                        <LI>electrode positions for each lead system (<EM>.elec </EM> <A href="file.php#asci">asci</A>),</LI>
                    </UL>
                </blockquote>
            </P>
        </blockquote>


        <A id="formats" name="formats"></A>
        <H2>File Formats</H2>


        <A id="matrix" name="matrix"></A>
        <H3>Matrix</H3>  

        <p class="text">
            The format of matrix files is:

            <blockquote>
                <TABLE>
                    <TBODY>
                        <TR>
                            <TD><b><font color="#888800">L (<EM>long</EM>),</font></b></TD>
                            <TD><b><font color="#888800">T (<EM>long</EM>)</font></b></TD>
                            <TD><b><font color="#888800">&nbsp; => &nbsp;</font></b></TD>
                            <TD><b><font color="#888800">p(1, 1),</font></b></TD>
                            <TD><b><font color="#888800">p(1, 2),</font></b></TD>
                            <TD><b><font color="#888800">...,</font></b></TD>
                            <TD><b><font color="#888800">p(1, T)</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">p(2, 1),</font></b></TD>
                            <TD><b><font color="#888800">p(2, 2),</font></b></TD>
                            <TD><b><font color="#888800">...,</font></b></TD>
                            <TD><b><font color="#888800">p(2, T)</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">p(L, 1),</font></b></TD>
                            <TD><b><font color="#888800">p(L, 2),</font></b></TD>
                            <TD><b><font color="#888800">...,</font></b></TD>
                            <TD><b><font color="#888800">p(L, T)</font></b></TD>
                        </TR>
                    </TBODY>
                </TABLE>
            </blockquote>
        </P>

        <p class="text">
            where L is the number of rows  that follow, T is the number of columns
            and p(l,t ) is the data (<EM>float type</EM>)
        </P>


        <A id="asci" name="asci"></A>
        <H3>Asci files</H3>  

        <p class="text">
            The format of asci (text) files is:

            <blockquote>
                <TABLE>
                    <TBODY>
                        <TR>
                            <TD><b><font color="#888800">L, 1</font></b></TD>
                            <TD><b><font color="#888800">&nbsp; => &nbsp;</font></b></TD>
                            <TD><b><font color="#888800">p(1, 1)</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">p(2, 1)</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">...</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">...</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">p(L, 1)</font></b></TD>
                        </TR>
                    </TBODY>
                </TABLE>
            </blockquote>
        </P>

        <p class="text">
            where L is the number of rows that follow and p(l, 1) is the data
        </P>


        <A id="geo" name="geo"></A>
        <H3>Geometry files</H3>

        <p class="text">
            The format of the files that describe triangulated geometries is as follows:

            <blockquote>
                <TABLE>
                    <TBODY>
                        <TR>
                            <TD><b><font color="#888800">npnt</font></b></TD>
                            <TD><b><font color="#888800">&nbsp; => &nbsp;</font></b></TD>
                            <TD><b><font color="#888800">1</font></b></TD>
                            <TD><b><font color="#888800">x(1),</font></b></TD>
                            <TD><b><font color="#888800">y(1),</font></b></TD>
                            <TD><b><font color="#888800">z(1)</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">2</font></b></TD>
                            <TD><b><font color="#888800">x(2),</font></b></TD>
                            <TD><b><font color="#888800">y(2),</font></b></TD>
                            <TD><b><font color="#888800">z(2)</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">npnt</font></b></TD>
                            <TD><b><font color="#888800">x(npnt),</font></b></TD>
                            <TD><b><font color="#888800">y(npnt),</font></b></TD>
                            <TD><b><font color="#888800">z(npnt)</font></b></TD>
                        </TR>
                    </TBODY>
                </TABLE>

                <BR />

                <TABLE>
                    <TBODY>
                        <TR>
                            <TD><b><font color="#888800">ntri</font></b></TD>
                            <TD><b><font color="#888800">&nbsp; => &nbsp;</font></b></TD>
                            <TD><b><font color="#888800">1</font></b></TD>
                            <TD><b><font color="#888800">ind(1, 1),</font></b></TD>
                            <TD><b><font color="#888800">ind(1, 2),</font></b></TD>
                            <TD><b><font color="#888800">ind(1, 3)</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">2</font></b></TD>
                            <TD><b><font color="#888800">ind(2, 1),</font></b></TD>
                            <TD><b><font color="#888800">ind(2, 2),</font></b></TD>
                            <TD><b><font color="#888800">ind(2, 3)</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                            <TD><b><font color="#888800">...</font></b></TD>
                        </TR>
                        <TR>
                            <TD />
                            <TD />
                            <TD><b><font color="#888800">ntri</font></b></TD>
                            <TD><b><font color="#888800">ind(ntri, 1),</font></b></TD>
                            <TD><b><font color="#888800">ind(ntri, 2),</font></b></TD>
                            <TD><b><font color="#888800">ind(ntri, 3)</font></b></TD>
                        </TR>
                    </TBODY>
                </TABLE>
            </blockquote>
        </P>

        <p class="text">
            where npnt is the number of nodes, x(i), y(i) and z(i) are the coordinates
            (in meters) of node i, ntri is the number of triangles, and ind(j,1), ind(j,2)
            and ind(j,3) are the indices of the nodes of triangle j. The order of the
            indices for a triangle defines the orientation of the triangle; when viewed from
            the outside the nodes are numbered clockwise.
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

