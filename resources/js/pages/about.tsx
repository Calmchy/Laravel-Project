import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { CarTaxiFront , Folder, LayoutGrid, Menu, Search, Info } from 'lucide-react';
import { about } from '@/routes';

export default function About() {
    return (
        <>
             <Head title="About" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

              
                    {/*
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div> */}
               
                <div className="grid auto-rows-min gap-12 md:grid-cols-3">
                    {/* flex justify-center items-center */}
                    <div className=" flex-col  gap-4 relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border min-h-[280px] py-4">
                        
                        <div className="relative z-10 flex h-full flex-col items-center justify-center p-6">
                        {/* update */}
                        <CarTaxiFront className='mb-4 w-20 h-20' />
                        
                         
                        <h3 className="text-center text-lg font-bold tracking tight">
                            ACC Official Seal
                        </h3>
                        <p className="mt-1 text-center text-sm text-muted-foreground">
                            Abuyog Community College
                        </p>
                        </div>
                    </div>
  

                    <div className=" flex-col  gap-1 relative  overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border min-h-[280px] py-4">
                        
                        <PlaceholderPattern className="absolute inset-0 size-full" />
                        <div className="relative z-10 flex h-full flex-col items-center justify-center p-6">


                        <img src="https://accabuyog.com/home/wp-content/themes/gwt-wordpress-26.0.0/images/transparency-seal-160x160.png" alt="transparency"
                        className="mb-4 h-40 w-40rounded-full object-cover md:h-44 md:w-44"
                        />
                        <h3 className="text-center text-lg font-bold tracking tight">
                           Transparency Seal
                        </h3>
                        <p className="mt-1 text-center text-sm text-muted-foreground">
                            Government Transparency
                        </p>
                        </div>
                    </div>





                    <div className=" flex-col gap-3 relative  overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border min-h-[280px] py-4">
                        
                        <h3 className=" text-center whitespace-nowrap text-lg bg-lime-800 px-4 py-1 text-xs md:text-sm font-bold tracking-tight text-whitet">
                                 FREEDOM OF INFORMATION
                                </h3>
                                <PlaceholderPattern className="absolute inset-0 size-full" />
                            <div className="relative z-10 flex h-full flex-col items-center justify-center p-6">
                        <img src="https://accabuyog.com/home/wp-content/themes/gwt-wordpress-26.0.0/images/foi-logo-160x160.png" alt="logo"
                        className='mb-4 h-40 w-40 rounded-full object-cover md:h-44 md:w-44'
                        // className="rounded-full w-full max-w-[210px] aspect-square object-cover"
                        />
                        <h3 className="text-center text-lg font-bold tracking tight">
                           FREEDOM OF INFORMATION
                        </h3>
                        <p className="mt-1 text-center text-sm text-muted-foreground">
                            FOI Philippines
                        </p>
                        </div>
                    </div>
                </div>



                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                   
                   <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    {/* flex justify-center items-center */}
                    <div className="flex justify-center items-center relative aspect-video  rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full" />
                      
                        
                        <div className="Space-y-6 px-5 py-5">
                            <div>
                                <h2 className="text-2x1 font-bold tracking-tight">
                                  ACC OFFICIAL SEAL
                                </h2>
                                <div className="space-y-4 text-sm loading-7 text-justify text-muted-foreground">
                                    <p>
                                        Since its founding on 1979, <strong> Gay ka Abuyog Community College</strong> has striven to provide students the knowledge, values, skills, and community involvement to enable them to excel as the forefront manpower of community and of the global arena. ACC aims for the creation of a scholastic environment composed of individuals that are grounded in faith, integrity, respect and trust.
                                    </p>
                                    <p>
                                        With today’s fast-paced global progress, ACC promotes and fosters the acquisition of attributes that will empower students to triumph against ignorance and mediocrity and contribute positively to nation building.
                                   
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-x1 font-semibold">
                                       
                                        The School LOGO:
                                    </h3>
                                </div>
                                <ul className="space-y-4 text-sm leading-7 text-muted-foreground">
                                    <li>
                                       <strong className="text-foreground">Laurel Wreath</strong> (Green) – a symbol of victory and honor. It symbolizes ACC’s triumph against ignorance and success in the search for truth and knowledge
                                    </li>
                                    <li>
                                        <strong className="text-foreground">Torch</strong> – an emblem of enlightenment and hope. It symbolizes the vision of ACC to provide light as a source of enlightenment to all students.
                                    </li>
                                    <li>
                                       <strong className="text-foreground">Scroll</strong> – an emblem of wisdom. It symbolizes translating academic work into meaningful presentations of expertise and scholarly work
                                </li>
                                <li>
                                    <strong className="text-foreground">Quill Pen and Ink</strong>
                                     – an instrument for writing which symbolizes freedom and independence to soar and be able to look at things from a wider perspective.
                                </li>
                                <li>
                                 <strong className="text-foreground">Bee</strong> – symbol for the Municipality of Abuyog, and; (You're GAY Geonard)
                                </li>
                                <li>
                                   <strong className="text-foreground">1997</strong> the year the college was established.
                                </li>
                                </ul>
                                
                            </div>

                        </div>
                        
                     </div>

                     {/* <div className="flex justify-center items-center relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full" />

                        <iframe src="https://www.youtube.com/embed/_dHiZW9oDdw" className="absolute inset-0 w-full h-full z-10" title="ACC video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
                        allowFullScreen></iframe>
                        
                        
                     </div> */}
                     <div className="space-y-6">
                      <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="border-b border-sidebar-border/70 px-5 py-5 dark:border-sidebar-border">
                        <h3 className='text-lg font-semibold'>Abuyog Community College</h3>
                        <p className='mt-1 text-sm text-muted-foreground'>Learn more about ACC and it's mission.</p>
                        </div>
                        
                        <div className="relative aspect-video">
                        <iframe src="https://www.youtube.com/embed/_dHiZW9oDdw" className="absolute inset-0 w-full h-full z-10" title="ACC video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
                        allowFullScreen></iframe>
                        </div>
                        </div>


                        <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="border-b border-sidebar-border/70 px-5 py-5 dark:border-sidebar-border">
                        <h3 className='text-lg font-semibold'>Abuyog Community College</h3>
                        <p className='mt-1 text-sm text-muted-foreground'>Descover about institotion</p>
                        </div>
                        
                        <div className="relative aspect-video">
                        <iframe src="https://www.youtube.com/embed/mCBtWIoT8ts?list=RDmCBtWIoT8ts" className="absolute inset-0 w-full h-full z-10" title="ACC video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
                        allowFullScreen></iframe>
                        </div>
                        </div>
                        
                     </div>
                        
                    </div>
                </div>
            </div>
        </>
    );
}

About.layout = {
    breadcrumbs: [
        {
            title: 'About',
            href: about(),
        },
    ],
};
