'use strict';

const SnoJetParts = (() => {
 const kirk = 'https://www.denniskirk.com';
 const reloaded = 'https://www.partsreloaded.com/Snowmobile/Electrical';
 const tillotson = 'https://tillotson.ie';
 const product = (label, url) => ({label, url, type: 'Listing'});
 const catalog = (label, url) => ({label, url, type: 'Catalog'});
 const reference = (label, url) => ({label, url, type: 'Reference'});
 const mfg = 'https://www.mfgsupply.com';
 const fuel = catalog('MFG Supply · fuel system', mfg + '/snowmobile/snowcarb.html');
 const fittings = catalog('MFG Supply · hose by size', mfg + '/snowmobile/snowcarb/snowcarbtubing.html');
 const filters = catalog('MFG Supply · fuel filters', mfg + '/snowmobile/snowcarb/snowcarbfilters.html');
 const astro = catalog('NAPA · 1974 Astro Jet', 'https://www.napaonline.com/en/motorcycle-atv-parts/sno-jet_snowmobile/astro_jet/1974');
 const engine = catalog('MFG Supply · snowmobile engine and bearings', mfg + '/snowmobile.html');
 const chassis = catalog('MFG Supply · snowmobile chassis parts', mfg + '/snowmobile.html');
 const suspension = catalog('MFG Supply · track, suspension and sprockets', mfg + '/snowmobile/snowsusp.html');
 const used = catalog('eBay · Sno-Jet used and reproduction parts', 'https://www.ebay.com/b/Snowmobile-Parts-for-Sno-Jet/100448/bn_7065569228');
 const beltChart = reference('Dayco application chart', 'https://www.dayco.com/wp-content/uploads/2025/03/2023-Powersports-Catalog_8-2023.pdf');
 const carbChart = reference('Tillotson HD factory parts list', tillotson + '/wp-content/uploads/2015/07/HD-Series-2-Parts-List.pdf');
 const ignitionChart = reference('BSL points and condenser cross-reference (page 109)', 'https://fliphtml5.com/zmjow/mmph/Catalogue_de_Motoneige_/109/');
 const part = (id, name, match, links) => ({id, name, match, links});
 const systems = [
  {
   id: 'fuel', name: 'Fuel & carburetor', phase: 'First start',
   parts: [
    part('carb-kit', 'HD-14A carburetor rebuild kit', 'Confirmed installed carburetor: Tillotson HD-14A. For a full DIY rebuild, Discount Marine DI 23398 explicitly lists HD-14A and includes the nozzle check valve. Tillotson lists RK-1HD as its repair kit and DG-1HD as the diaphragm and gasket set. Use the factory diagram and compare the new pieces with the originals.', [
     product('Discount Marine · HD-14A full kit DI 23398', 'https://www.dicarbparts.com/custom-carburetor-kits/208-tillotson-hd13a-hd14a-hd15a-hd17a-hd18a-hd19a-hd23a-hd24a-hd26a-hd29a-hd32a-carb-kit-di-23398.html'),
     product('EC Carburetors · DG-1HD-style gasket kit', 'https://www.eccarburetors.com/Tillotson-HD-Gasket-Kit_p_511.html'), carbChart,
    ]),
    part('carb-body', 'Complete carburetor or donor body', 'Keep the installed Tillotson for the DIY rebuild. If the body is damaged, look for a donor HD-14A and compare the mounting, linkage and parts diagram. A matching carb stamp establishes the installed type. Use the Sno-Jet parts book to establish what it left the factory with.', [used, carbChart]),
    part('intake', 'Intake boot, flange & gaskets', 'Inspect for cracks or loose joints. Match the carb flange pattern, engine-side opening and gasket shape.', [fuel, engine]),
    part('fuel-hose', 'Fuel hose, pulse hose & clamps', 'Measure the fitting diameter and required length. Use fuel-rated hose for fuel and the specified impulse hose where fitted.', [fittings, fuel]),
    part('fuel-filter', 'Fuel filter, pickup & tank fittings', 'Match inline or in-tank pickup style and barb size. Inspect the tank, grommet and vent or cap. Filter 07-705 is a 1/4-inch inline option if that matches the measured fittings.', [product('MFG Supply · 1/4-inch inline 07-705', mfg + '/snowmobile/snowcarb/snowcarbfilters/07-705.html'), filters]),
    part('fuel-pump', 'Pulse pump or rebuild kit', 'The HD-14A parts diagram includes a fuel-pump diaphragm and gasket. Compare those with the chosen rebuild kit. If there is also a separate pump on this sled, identify its body, pulse port and outlet count before buying one.', [carbChart, catalog('MFG Supply · fuel pumps', mfg + '/snowmobile/snowcarb/snowfuelpumps.html')]),
    part('throttle', 'Throttle cable, choke or primer', 'Match cable ends, travel and length. Check throttle return and identify the choke or primer before ordering.', [fuel, chassis]),
   ],
  },
  {
   id: 'spark', name: 'Spark & ignition', phase: 'First start',
   parts: [
    part('spark-plugs', 'Spark plugs', 'Champion lists RN3C for a 1973–74 Sno-Jet 338 application. Match the engine tag and factory spec for plug reach, heat range and gap before buying a pair.', [product('NAPA · Champion RN3C', 'https://www.napaonline.com/en/p/CHA880'), catalog('The Wrench Monkey · Astro Jet 340 plugs', 'https://www.thewrenchmonkey.ca/auto-parts/sno-jet/astro-jet-340/1974/spark-plug'), catalog('NGK authorized stores', 'https://ngksparkplugs.com/en/about-us/where-to-buy'), reference('Champion application catalog', 'https://driv.md/sites/default/files/uploads/2016-02/champion-catcm1502-small_engines_15-16.pdf')]),
    part('points', 'Breaker points', 'Identify the stator and verify it uses points. Parts Reloaded lists Yamaha/Sno-Jet item 020 against 810365 / 8068132120. Match the OEM number, mounting and each side before ordering a pair.', [product('MFG Supply · SPI 01-020', 'https://www.mfgsupply.com/01-020-yamaha-sno-jet-suzuki-snowmobile-ignition-point-for-70-77-snowmobile-s.html'), catalog('Parts Reloaded · points 020', reloaded + '/Ignition-Points-Condensers/Points'), ignitionChart]),
    part('condensers', 'Condensers', 'Parts Reloaded lists Sno-Jet/Yamaha item 038 against 810315 / 802-81325-20. Match the original number, size, lead and mounting.', [product('MFG Supply · condenser 01-038', 'https://www.mfgsupply.com/snowmobile/snowel/snowconds/01-038.html'), ignitionChart]),
    part('external-coil', 'External coil, leads & plug caps', 'Check spark on each cylinder and inspect leads, caps and grounds. Match the coil number and plug cap type to the ignition.', [product('MFG Supply · 01-085 for Yamaha S338', 'https://www.mfgsupply.com/snowmobile/snowel/snowcoils/snowyamcoils/snowyamextcoils/01-085.html'), product('Dennis Kirk · IGN-085 for Astro Jet 340', kirk + '/parts-unlimited/external-ignition-coil.p20191.prd/1974-sno-jet-astro-jet-340')]),
    part('stator', 'Stator, flywheel & ignition module', 'Identify the ignition type and stamped assembly numbers. Check the flywheel key, wiring and connections before replacing an assembly.', [astro, engine]),
    part('switches', 'Kill switch, key switch & wiring', 'Match switch function, wiring and connector. Confirm the engine shutoff works before running the sled.', [astro, used]),
   ],
  },
  {
   id: 'engine', name: 'Engine & starting', phase: 'First start',
   parts: [
    part('recoil', 'Recoil rope, spring & pawls', 'Inspect the starter and match the recoil housing and pawl geometry. Dennis Kirk lists SPI 11-311 for the 1974 Astro Jet 340. Recreation Supply lists spring 011-208 and pawl kit 011-311 for the 1974 Astro Jet 340.', [product('Dennis Kirk · SPI 11-311', kirk + '/sports-parts-inc/pawl-kit-for-recoil-starter-11-311.p15588.prd/1974-sno-jet-astro-jet-340'), catalog('Garage Harry Stanley · spring 740-6009 (11-208)', 'https://www.garageharrystanley.com/collections/engine-atv-copy'), reference('Recreation Supply · recoil application table', 'https://recreationsupply.co/table/rewind-spring-and-pawls')]),
    part('seals', 'Crank seals & engine gaskets', 'Check compression and investigate air leaks before buying engine internals. Match seals and gaskets to the engine tag, dimensions and parts diagram.', [engine]),
    part('pistons', 'Pistons, rings & wrist-pin bearings', 'Order after diagnosis. Confirm the engine code, measured bore and any oversize markings, plus ring and pin dimensions.', [engine]),
    part('exhaust', 'Exhaust flange gasket, joint & springs', 'Inspect for leaks and damaged mounts. Match flange dimensions, joint style and spring length.', [chassis, engine]),
    part('electric-start', 'Starter motor, solenoid & battery', 'If electric start is fitted, check the cables and grounds. Match the starter number and battery specification, terminal layout and tray size.', [astro, chassis]),
   ],
  },
  {
   id: 'drive', name: 'Belt, clutches & chaincase', phase: 'Before riding',
   parts: [
    part('drive-belt', 'Drive belt and spare', 'Dayco lists HP3009 for the 1974 Astro Jet 340. JayDee lists OEM 050399 and MAX1065M3 for the 1974 Astro-Jet. Compare the old belt markings, width and installed clutches before buying a main belt or spare.', [product('MFG Supply · Dayco HP3009', 'https://www.mfgsupply.com/hp3009.html'), product('Dennis Kirk · Dayco HP3009', kirk + '/dayco/hp-high-performance-belt-hp3009.p020187.prd/1974-sno-jet-astro-ss-340'), beltChart, reference('JayDee vintage belt cross-reference', 'https://www.jdv-belts.com/images/vintage%20snow%20catalog%201.31.08.pdf')]),
    part('clutches', 'Primary and secondary clutch wear parts', 'Record both clutch numbers. Inspect sheaves, rollers, bushings and buttons. Match springs and weights to the specific assembly.', [chassis, used]),
    part('chaincase', 'Chaincase gasket, chain, sprockets & bearings', 'Inspect for wear and leaks. Match gasket shape, chain pitch and link count, tooth counts and bearing markings.', [chassis]),
   ],
  },
  {
   id: 'ride', name: 'Brakes, track & steering', phase: 'Before riding',
   parts: [
    part('brakes', 'Brake pads or shoes, cable & hardware', 'SP1 05-152-01 lists the 1974 Astro Jet 340 with cross-references Sno-Jet 181898 and 181899. Compare the pad shape, brake assembly and cable ends. Verify brake operation before riding.', [product('SoCal Powersports · SP1 05-152-01', 'https://www.socalpowersports.com/i-31657441-sp1-brake-pads-semi-metallic-05-152-01.html'), chassis]),
    part('track', 'Track, clips & drive sprockets', 'Inspect for cracks, tears, damaged clips and missing lugs. Match width, pitch, length, drive openings and clearance.', [chassis]),
    part('suspension', 'Idler or bogie wheels, bearings & slides', 'Identify the suspension. Match wheel diameter and bearing size, or slide profile and length on slide-equipped sleds.', [suspension, reference('Harlan’s slide chart', 'https://snowmobileparts.com/images/pdf/harlans_hyfax.pdf')]),
    part('steering', 'Ski runners, steering joints & bushings', 'Check runner wear and steering play. Trans Can lists three-bolt runner 907-3020 and carbide 909-3020 for the 1974 Astro 340/440. Compare stud spacing and shape with the skis on the sled.', [reference('Trans Can · runner fitment chart', 'https://www.transcanimports.com/downloads/Snowmobile%20Catalogue/Skis%20%26%20Runners%20-%20Runners.pdf'), chassis, suspension]),
    part('trim', 'Original snow flap, seat cover & windshield', 'Keep the molded Sno-Jet flap as a pattern. Match its raised border, rounded corners and mounting holes. Compare used or reproduction pieces to the original before buying.', [used]),
    part('guards', 'Belt guard, lights & mounts', 'Check that the guard is present and secure, the lights work, and the mounts are intact. Compare original numbers for used guards and brackets.', [astro, used]),
   ],
  },
 ];
 const references = [
  beltChart, carbChart,
  reference('Sno-Jet model-number key (1975 book with 1974 decoding)', 'https://vintagesnow.com/Sno-Jet_files/1975_SST_Astro.pdf'),
  catalog('1974–1976 Astro Jet parts books (paid reproduction)', 'https://www.etsy.com/listing/944054571/snojet-astrojet-1974-1975-1976'),
  catalog('1974 Sno-Jet engine manual (paid copy)', 'https://www.emanualonline.com/powersports/snowmobiles/sno-jet/1974-sno-jet-snojet-snowmobile-engine-manual-emo-85709'),
 ];
 return {systems, references};
})();
